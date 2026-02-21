"""
Thesis Lab Backend API
AI Evaluation Mining Platform
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os
from datetime import datetime
from starlette.middleware.base import BaseHTTPMiddleware

# Initialize FastAPI app
app = FastAPI(
    title="Thesis Lab API",
    description="AI Evaluation Mining Platform Backend",
    version="1.0.0"
)

# Custom CORS Middleware to ensure headers are always sent
class CustomCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add CORS headers to every response
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        
        return response

# Add custom CORS middleware first
app.add_middleware(CustomCORSMiddleware)

# FastAPI CORS middleware as backup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

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
    created_at: Optional[datetime] = None

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
    response = {
        "name": "Thesis Lab API",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "tasks": "/tasks",
            "tasks_detail": "/tasks/{task_id}",
            "submit": "/api/submit"
        }
    }
    return response

@app.get("/health")
async def health_check():
    """Health check endpoint for Railway"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "thesis-lab-backend"
    }

# ============================================
# TASK ENDPOINTS
# ============================================

# Mock data for testing - Replace with Supabase queries
MOCK_TASKS = [
    {
        "id": "task-001",
        "title": "Basic Math Evaluation",
        "description": "Solve the given math problem: 2+2+2+2+2",
        "task_type": "math_problem",
        "difficulty_level": "easy",
        "reward_per_submission": 10.0,
        "verification_criteria": "Correct numerical answer with calculation",
        "status": "active",
        "max_submissions": 100,
        "current_submissions": 0,
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "task-002",
        "title": "Python Code Review",
        "description": "Review this Python function and identify bugs",
        "task_type": "code_review",
        "difficulty_level": "medium",
        "reward_per_submission": 25.0,
        "verification_criteria": "Identifies division by zero error",
        "status": "active",
        "max_submissions": 50,
        "current_submissions": 5,
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "task-003",
        "title": "Creative Writing",
        "description": "Write a 50-word product description",
        "task_type": "creative_writing",
        "difficulty_level": "medium",
        "reward_per_submission": 20.0,
        "verification_criteria": "Creative, engaging, within word limit",
        "status": "active",
        "max_submissions": 75,
        "current_submissions": 12,
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "task-004",
        "title": "Data Analysis Challenge",
        "description": "Analyze sales data and calculate growth rate",
        "task_type": "data_analysis",
        "difficulty_level": "hard",
        "reward_per_submission": 35.0,
        "verification_criteria": "Accurate calculations with insights",
        "status": "active",
        "max_submissions": 30,
        "current_submissions": 3,
        "created_at": datetime.now().isoformat()
    }
]

@app.get("/tasks")
async def get_tasks(
    limit: int = 10,
    offset: int = 0,
    difficulty: Optional[str] = None,
    status: str = "active"
):
    """
    Get list of tasks
    
    Query Parameters:
    - limit: Number of tasks to return (default 10)
    - offset: Number of tasks to skip (default 0)
    - difficulty: Filter by difficulty (easy, medium, hard)
    - status: Filter by status (active, closed, pending)
    """
    
    # Filter tasks
    filtered_tasks = [
        task for task in MOCK_TASKS
        if task["status"] == status
        and (difficulty is None or task["difficulty_level"] == difficulty)
    ]
    
    # Apply pagination
    paginated_tasks = filtered_tasks[offset:offset + limit]
    
    return {
        "tasks": paginated_tasks,
        "total": len(filtered_tasks),
        "limit": limit,
        "offset": offset
    }

@app.get("/tasks/{task_id}")
async def get_task(task_id: str):
    """Get a specific task by ID"""
    
    # Find task
    task = next((t for t in MOCK_TASKS if t["id"] == task_id), None)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task

# ============================================
# SUBMISSION ENDPOINT
# ============================================

@app.post("/api/submit")
async def submit_task(submission: Submission):
    """
    Submit a task solution for AI verification
    
    This endpoint:
    1. Receives the submission
    2. Calls Claude AI for verification
    3. Returns verification results and rewards
    """
    
    # TODO: Implement Claude AI verification
    # For now, return mock response
    
    return {
        "success": True,
        "submission_id": f"sub-{datetime.now().timestamp()}",
        "ai_score": 0.95,
        "is_valid": True,
        "feedback": "Great work! Your answer is correct.",
        "reward_earned": 10.0,
        "reputation_gained": 5,
        "message": "Submission verified successfully!"
    }

# ============================================
# USER ENDPOINTS (Future)
# ============================================

@app.get("/api/users/{wallet_address}")
async def get_user(wallet_address: str):
    """Get user profile and stats"""
    
    # TODO: Implement Supabase query
    return {
        "wallet_address": wallet_address,
        "reputation_score": 100,
        "total_tasks_completed": 5,
        "total_rewards_earned": 150.0,
        "rank": "Bronze"
    }

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
