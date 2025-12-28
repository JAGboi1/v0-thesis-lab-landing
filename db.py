"""
Supabase Database Connection
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load .env file
load_dotenv()

# Get credentials from .env
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in .env file")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase():
    """Get Supabase client instance"""
    return supabase
