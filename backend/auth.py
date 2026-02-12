"""
Authentication Module - Dynamic.xyz JWT Verification
Verifies wallet-signed JWTs issued by Dynamic.xyz and resolves the current user.

Flow:
    1. Frontend connects wallet via Dynamic.xyz SDK
    2. Dynamic issues a signed JWT containing verified wallet address
    3. Frontend sends JWT in Authorization header: "Bearer <token>"
    4. This module verifies the JWT signature against Dynamic's public JWKS
    5. Extracts wallet address and returns/creates the user record
    6. Protected routes use Depends(get_current_user) to enforce auth
"""

import os
import logging
from typing import Optional, Dict, Any

import httpx
from jose import jwt, JWTError
from jose.backends import RSAKey
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from db import get_supabase
from services import UserService

logger = logging.getLogger(__name__)

# ============================================================================
# CONFIG
# ============================================================================

DYNAMIC_ENVIRONMENT_ID = os.getenv("DYNAMIC_ENVIRONMENT_ID")

# Dynamic's JWKS endpoint — used to verify JWT signatures
# This is public and does not require auth
DYNAMIC_JWKS_URL = (
    f"https://app.dynamic.xyz/api/v0/sdk/{DYNAMIC_ENVIRONMENT_ID}/.well-known/jwks"
)

# Cache the JWKS in memory so we don't hit Dynamic's endpoint on every request
# In production you'd want a TTL cache (e.g. via cachetools), but a module-level
# dict is fine for now — it resets on each server restart
_jwks_cache: Optional[Dict] = None

# FastAPI's built-in Bearer token extractor
bearer_scheme = HTTPBearer(auto_error=False)


# ============================================================================
# JWKS FETCHING
# ============================================================================

async def get_jwks() -> Dict:
    """
    Fetch Dynamic's JSON Web Key Set (public keys used to verify JWTs).
    Cached in memory after first fetch.
    """
    global _jwks_cache

    if _jwks_cache is not None:
        return _jwks_cache

    if not DYNAMIC_ENVIRONMENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="DYNAMIC_ENVIRONMENT_ID is not set in environment variables",
        )

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(DYNAMIC_JWKS_URL, timeout=10.0)
            response.raise_for_status()
            _jwks_cache = response.json()
            logger.info("Successfully fetched Dynamic JWKS")
            return _jwks_cache

    except httpx.HTTPError as e:
        logger.error(f"Failed to fetch Dynamic JWKS: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not reach Dynamic.xyz to verify credentials. Try again.",
        )


def clear_jwks_cache():
    """
    Force a fresh JWKS fetch on next request.
    Call this if you start seeing 'unable to verify signature' errors —
    Dynamic may have rotated their keys.
    """
    global _jwks_cache
    _jwks_cache = None
    logger.info("JWKS cache cleared")


# ============================================================================
# JWT VERIFICATION
# ============================================================================

async def verify_dynamic_token(token: str) -> Dict[str, Any]:
    """
    Verify a Dynamic.xyz JWT and return its decoded payload.

    Raises HTTPException 401 if:
    - Token is missing or malformed
    - Signature verification fails
    - Token is expired
    - Required claims (wallet address) are missing
    """
    jwks = await get_jwks()

    try:
        # Decode and verify — jose handles signature check, expiry, and algorithm
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            options={"verify_aud": False},  # Dynamic doesn't set aud by default
        )
        return payload

    except JWTError as e:
        error_msg = str(e)
        logger.warning(f"JWT verification failed: {error_msg}")

        # If signature failed it might be a key rotation — clear cache and retry once
        if "signature" in error_msg.lower():
            logger.info("Signature error — clearing JWKS cache and retrying")
            clear_jwks_cache()
            fresh_jwks = await get_jwks()
            try:
                payload = jwt.decode(
                    token,
                    fresh_jwks,
                    algorithms=["RS256"],
                    options={"verify_aud": False},
                )
                return payload
            except JWTError:
                pass  # Fall through to 401 below

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token. Please reconnect your wallet.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def extract_wallet_address(payload: Dict[str, Any]) -> str:
    """
    Pull the verified wallet address out of a Dynamic JWT payload.

    Dynamic stores the wallet address in the 'verified_credentials' array.
    Each entry has an 'address' field and a 'chain' field.
    We return the first EVM or Solana address we find.

    Payload structure (simplified):
    {
        "sub": "user-uuid",
        "verified_credentials": [
            {
                "address": "0xabc...",
                "chain": "eip155",          # EVM
                "wallet_name": "metamask",
                ...
            }
        ],
        "iat": 1234567890,
        "exp": 1234567890
    }
    """
    credentials = payload.get("verified_credentials", [])

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No verified wallet credentials found in token.",
        )

    # Prefer EVM, fall back to Solana, then take whatever is first
    for cred in credentials:
        chain = cred.get("chain", "")
        address = cred.get("address", "")
        if chain == "eip155" and address:  # EVM
            return address

    for cred in credentials:
        chain = cred.get("chain", "")
        address = cred.get("address", "")
        if chain == "solana" and address:
            return address

    # Last resort — take the first address regardless of chain
    first_address = credentials[0].get("address", "")
    if first_address:
        return first_address

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not extract wallet address from token.",
    )


# ============================================================================
# FASTAPI DEPENDENCIES
# ============================================================================

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Dict[str, Any]:
    """
    FastAPI dependency — resolves the authenticated user from the JWT.

    Usage on any protected route:
        @app.post("/tasks/create")
        async def create_task(
            request: CreateTaskRequest,
            current_user: dict = Depends(get_current_user)
        ):
            developer_wallet = current_user["wallet_address"]
            ...

    Returns the full user record from the database (same shape as UserService returns).
    Auto-creates the user record on first login.

    Raises 401 if no token is provided or token is invalid.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please connect your wallet.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify the JWT
    payload = await verify_dynamic_token(credentials.credentials)

    # Extract the wallet address
    wallet_address = extract_wallet_address(payload)

    # Get or create user record — first wallet connection auto-creates the profile
    user = UserService.get_or_create_user(wallet_address=wallet_address)

    # Attach the Dynamic sub (their internal user ID) to the record in case you
    # ever need to call Dynamic's management API
    user["dynamic_user_id"] = payload.get("sub")

    return user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Optional[Dict[str, Any]]:
    """
    Same as get_current_user but does NOT raise 401 if no token is present.
    Returns None for unauthenticated requests.

    Use this on public routes that show richer data when logged in,
    e.g. task listing can show whether the user already submitted.

        @app.get("/tasks")
        async def list_tasks(
            current_user: Optional[dict] = Depends(get_current_user_optional)
        ):
            ...
    """
    if credentials is None:
        return None

    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


# ============================================================================
# ROLE HELPERS
# ============================================================================

def require_developer(current_user: Dict[str, Any]) -> Dict[str, Any]:
    """
    Placeholder for future role-based access control.

    Right now any authenticated wallet can post tasks.
    When you add developer tiers or whitelisting, check here.

    Usage:
        @app.post("/tasks/create")
        async def create_task(
            request: CreateTaskRequest,
            current_user: dict = Depends(get_current_user)
        ):
            require_developer(current_user)  # will raise 403 if not allowed
            ...
    """
    # TODO: add developer role check once you have a roles system
    return current_user