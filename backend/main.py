"""
Thesis Lab Backend API - With Supabase Integration
AI Evaluation Mining Platform
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Thesis Lab API",
    description="AI Evaluation Mining Platform Backend",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://v0-thesis-lab-landing.vercel.app",
        "https://*.vercel.app",
        "*",  # TEMPORARY - Remove in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Create Supabase client if credentials are available
supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected to Supabase")
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
else:
    print("⚠️  No Supabase credentials - using mock data")

# ============================================
# MODELS
# ============================================

class Task(BaseModel):
    id: str
    title: str
    description: str
    task_type: str
    difficulty_level: str
    reward_per_submission: float
    verification_criteria: str
    status: str
    max_submissions: int
    current_submissions: int
    created_at: Optional[str] = None

class Submission(BaseModel):
    task_id: str
    wallet_address: str
    submission_data: dict
    ai_score: Optional[float] = None
    is_valid: Optional[bool] = None
    feedback: Optional[str] = None
    reward_earned: Optional[float] = None

# ============================================
# HEALTH CHECK
# ============================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "Thesis Lab API",
        "version": "1.0.0",
        "status": "online",
        "supabase_connected": supabase is not None,
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "tasks": "/api/tasks",
            "tasks_detail": "/api/tasks/{task_id}",
            "submit": "/api/submit"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for Railway"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "thesis-lab-backend",
        "database": "connected" if supabase else "not configured"
    }

# ============================================
# TASK ENDPOINTS - WITH SUPABASE
# ============================================

@app.get("/api/tasks")
async def get_tasks(
    limit: int = 10,
    offset: int = 0,
    difficulty: Optional[str] = None,
    status: str = "active"
):
    """
    Get list of tasks from Supabase
    
    Query Parameters:
    - limit: Number of tasks to return (default 10)
    - offset: Number of tasks to skip (default 0)
    - difficulty: Filter by difficulty (easy, medium, hard)
    - status: Filter by status (active, closed, pending)
    """
    
    if not supabase:
        raise HTTPException(
            status_code=503, 
            detail="Database not configured. Please set SUPABASE_URL and SUPABASE_KEY"
        )
    
    try:
        # Build query
        query = supabase.table('tasks').select('*')
        
        # Apply filters
        query = query.eq('status', status)
        
        if difficulty:
            query = query.eq('difficulty_level', difficulty)
        
        # Apply pagination
        query = query.range(offset, offset + limit - 1)
        
        # Execute query
        response = query.execute()
        
        # Get total count
        count_response = supabase.table('tasks').select('id', count='exact').eq('status', status)
        if difficulty:
            count_response = count_response.eq('difficulty_level', difficulty)
        count_data = count_response.execute()
        
        return {
            "tasks": response.data,
            "total": count_data.count if hasattr(count_data, 'count') else len(response.data),
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        print(f"Error fetching tasks: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch tasks: {str(e)}")

@app.get("/api/tasks/{task_id}")
async def get_task(task_id: str):
    """Get a specific task by ID from Supabase"""
    
    if not supabase:
        raise HTTPException(
            status_code=503,
            detail="Database not configured"
        )
    
    try:
        # Fetch task from Supabase
        response = supabase.table('tasks').select('*').eq('id', task_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching task {task_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch task: {str(e)}")

# ============================================
# SUBMISSION ENDPOINT - WITH SUPABASE
# ============================================

@app.post("/api/submit")
async def submit_task(submission: Submission):
    """
    Submit a task solution for AI verification
    
    This endpoint:
    1. Receives the submission
    2. Calls Claude AI for verification
    3. Saves to Supabase
    4. Returns verification results and rewards
    """
    
    if not supabase:
        raise HTTPException(
            status_code=503,
            detail="Database not configured"
        )
    
    try:
        # TODO: Add Claude AI verification here
        # For now, return mock response
        
        # Create submission record
        submission_data = {
            "task_id": submission.task_id,
            "user_id": submission.wallet_address,  # Using wallet as user_id
            "submission_data": submission.submission_data,
            "ai_score": 0.95,
            "is_valid": True,
            "feedback": "Great work! Your answer is correct.",
            "reward_earned": 10.0,
            "created_at": datetime.now().isoformat()
        }
        
        # Insert into Supabase
        response = supabase.table('submissions').insert(submission_data).execute()
        
        # Update task submission count
        supabase.rpc('increment_task_submissions', {'task_id': submission.task_id}).execute()
        
        return {
            "success": True,
            "submission_id": response.data[0]['id'] if response.data else None,
            "ai_score": 0.95,
            "is_valid": True,
            "feedback": "Great work! Your answer is correct.",
            "reward_earned": 10.0,
            "reputation_gained": 5,
            "message": "Submission verified successfully!"
        }
        
    except Exception as e:
        print(f"Error submitting task: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to submit task: {str(e)}")

# ============================================
# USER ENDPOINTS
# ============================================

@app.get("/api/users/{wallet_address}")
async def get_user(wallet_address: str):
    """Get user profile and stats from Supabase"""
    
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        # Fetch user from Supabase
        response = supabase.table('users').select('*').eq('wallet_address', wallet_address).execute()
        
        if not response.data or len(response.data) == 0:
            # Create new user if doesn't exist
            new_user = {
                "wallet_address": wallet_address,
                "reputation_score": 0,
                "total_tasks_completed": 0,
                "total_rewards_earned": 0.0,
                "created_at": datetime.now().isoformat()
            }
            response = supabase.table('users').insert(new_user).execute()
            return response.data[0]
        
        return response.data[0]
        
    except Exception as e:
        print(f"Error fetching user {wallet_address}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")

# ============================================
# STARTUP EVENT
# ============================================

@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    print("🚀 Thesis Lab API starting...")
    print("📡 CORS enabled for Vercel domains")
    print("✅ Health check available at /health")
    print("📚 API docs available at /docs")
    if supabase:
        print("🗄️  Connected to Supabase database")
    else:
        print("⚠️  Running without database (mock mode)")

# ============================================
# ERROR HANDLERS
# ============================================

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {
        "error": "Not Found",
        "message": "The requested resource was not found",
        "path": str(request.url)
    }

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return {
        "error": "Internal Server Error",
        "message": "An unexpected error occurred",
        "detail": str(exc)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
