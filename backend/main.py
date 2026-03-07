"""
Thesis Lab Backend API - Fixed Version
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse  # ← IMPORTANT: This import is required!
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from datetime import datetime

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
        "https://v0-thesis-lab-landing.vercel.app",
        "https://*.vercel.app",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# MOCK DATA FOR TESTING
# ============================================

MOCK_TASKS = [
    {
        "id": "task-001",
        "title": "Basic Math Evaluation",
        "description": "Solve: 2+2+2+2+2",
        "task_type": "math_problem",
        "difficulty_level": "easy",
        "reward_per_submission": 10.0,
        "verification_criteria": "Correct answer",
        "status": "active",
        "max_submissions": 100,
        "current_submissions": 0,
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "task-002",
        "title": "Python Code Review",
        "description": "Review this code and find bugs",
        "task_type": "code_review",
        "difficulty_level": "medium",
        "reward_per_submission": 25.0,
        "verification_criteria": "Identifies bugs",
        "status": "active",
        "max_submissions": 50,
        "current_submissions": 0,
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "task-003",
        "title": "Creative Writing",
        "description": "Write a 50-word product description",
        "task_type": "creative_writing",
        "difficulty_level": "medium",
        "reward_per_submission": 20.0,
        "verification_criteria": "Creative and within limit",
        "status": "active",
        "max_submissions": 75,
        "current_submissions": 0,
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "task-004",
        "title": "Data Analysis",
        "description": "Analyze sales data",
        "task_type": "data_analysis",
        "difficulty_level": "hard",
        "reward_per_submission": 35.0,
        "verification_criteria": "Accurate analysis",
        "status": "active",
        "max_submissions": 30,
        "current_submissions": 0,
        "created_at": datetime.now().isoformat()
    }
]

# ============================================
# HEALTH CHECK
# ============================================

@app.get("/")
async def root():
    return {
        "name": "Thesis Lab API",
        "version": "1.0.0",
        "status": "online",
        "mode": "mock_data"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "thesis-lab-backend"
    }

# ============================================
# TASK ENDPOINTS
# ============================================

@app.get("/api/tasks")
async def get_tasks(
    limit: int = 10,
    offset: int = 0,
    difficulty: Optional[str] = None,
    status: str = "active"
):
    """Get list of tasks"""
    
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

@app.get("/api/tasks/{task_id}")
async def get_task(task_id: str):
    """Get a specific task by ID"""
    
    task = next((t for t in MOCK_TASKS if t["id"] == task_id), None)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task

@app.post("/api/submit")
async def submit_task(submission: dict):
    """Submit a task solution"""
    
    return {
        "success": True,
        "submission_id": f"sub-{datetime.now().timestamp()}",
        "ai_score": 0.95,
        "is_valid": True,
        "feedback": "Great work!",
        "reward_earned": 10.0,
        "reputation_gained": 5,
        "message": "Submission verified successfully!"
    }

# ============================================
# STARTUP
# ============================================

@app.on_event("startup")
async def startup_event():
    print("🚀 Thesis Lab API starting...")
    print("📡 CORS enabled")
    print("✅ Health check at /health")
    print("📚 API docs at /docs")
    print("⚠️  Using mock data (no database)")

# ============================================
# ERROR HANDLERS - FIXED!
# ============================================

@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "message": "The requested resource was not found",
            "path": str(request.url)
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred",
            "detail": str(exc)
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
