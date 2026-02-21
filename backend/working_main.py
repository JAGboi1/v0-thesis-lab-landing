from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any
import uuid
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Ritual Mining API",
    description="Proof-of-Inference Mining Platform",
    version="0.1.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with brief API info"""
    return {
        "status": "success",
        "message": "Ritual Mining API - see /docs for OpenAPI, /health for status",
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.utcnow()}

# Test endpoint
@app.get("/test")
async def test_endpoint():
    """Simple test endpoint to verify API is working"""
    return {"status": "success", "message": "API is working!"}

# Pydantic models
class CreateTaskRequest(BaseModel):
    """Request to create a new task"""
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20)
    task_type: str = Field(..., pattern="^(evaluation|prediction|code_execution|classification|annotation|human_review)$")
    difficulty_level: str = Field(..., pattern="^(easy|medium|hard)$")
    reward_per_submission: float = Field(..., gt=0)
    total_budget: float = Field(..., gt=0)
    max_submissions: Optional[int] = None
    verification_criteria: Dict[str, Any]
    instructions: Dict[str, Any]

class SubmitInferenceRequest(BaseModel):
    """Request to submit work for a task"""
    submission_data: Dict[str, Any]

# Mock task storage (in production, use database)
tasks_db = {}
submissions_db = {}

@app.post("/tasks/create")
async def create_task(task_data: CreateTaskRequest):
    """Create a new mining task"""
    try:
        logger.info(f"Creating task with data: {task_data.dict()}")
        
        task_id = str(uuid.uuid4())
        
        # Store task (in production, save to database)
        tasks_db[task_id] = {
            "id": task_id,
            **task_data.dict(),
            "created_at": datetime.utcnow(),
            "status": "active",
            "current_submissions": 0
        }
        
        response_data = {
            "status": "success",
            "task_id": task_id,
            "message": "Task created successfully",
            "data": task_data.dict()
        }
        
        logger.info(f"Task created: {response_data}")
        return response_data
        
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create task: {str(e)}"
        )

@app.get("/tasks")
async def list_tasks(limit: int = 50, offset: int = 0):
    """List all active tasks with pagination"""
    try:
        # Get tasks from mock storage
        tasks = list(tasks_db.values())[offset:offset+limit]
        
        return {
            "status": "success",
            "tasks": tasks,
            "total": len(tasks),
            "limit": limit,
            "offset": offset
        }
    
    except Exception as e:
        error_msg = f"Error listing tasks: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/tasks/{task_id}")
async def get_task(task_id: str):
    """Get details of a specific task"""
    try:
        task = tasks_db.get(task_id)
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return {
            "status": "success",
            "task": task
        }
    
    except HTTPException as he:
        raise he
    except Exception as e:
        error_msg = f"Error getting task {task_id}: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/tasks/{task_id}/submit")
async def submit_inference(task_id: str, request: SubmitInferenceRequest):
    """Submit work for a task"""
    try:
        # Validate task exists
        task = tasks_db.get(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Create submission (mock)
        submission_id = str(uuid.uuid4())
        submissions_db[submission_id] = {
            "id": submission_id,
            "task_id": task_id,
            "submission_data": request.submission_data,
            "created_at": datetime.utcnow(),
            "status": "pending"
        }
        
        # Mock verification (in production, call Claude)
        verification_result = {
            "ai_score": 0.85,
            "is_valid": True,
            "feedback": "Good submission"
        }
        
        reward_earned = task["reward_per_submission"] * verification_result["ai_score"]
        
        # Update submission with verification results
        submissions_db[submission_id].update({
            "ai_score": verification_result["ai_score"],
            "is_valid": verification_result["is_valid"],
            "feedback": verification_result["feedback"],
            "reward_earned": reward_earned,
            "status": "completed"
        })
        
        return {
            "status": "success",
            "submission_id": submission_id,
            "verification": verification_result,
            "reward_earned": reward_earned
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
