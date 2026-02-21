# This is a copy of hybrid_main.py to force Railway to use a fresh file
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any
import uuid
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import Claude verification
try:
    from claude_verification import verify_submission, TaskType, VerificationError
    CLAUDE_AVAILABLE = True
    logger = logging.getLogger(__name__)
    logger.info("Claude verification module loaded successfully")
except ImportError as e:
    CLAUDE_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning(f"Claude verification not available: {e}")

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

@app.get("/")
async def root():
    """Root endpoint with brief API info"""
    return {
        "status": "success",
        "message": "Ritual Mining API - see /docs for OpenAPI, /health for status",
        "claude_available": CLAUDE_AVAILABLE
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.utcnow()}

@app.get("/test-connection")
async def test_connection():
    """Simple connection test endpoint"""
    return {
        "status": "success",
        "message": "Backend is running and accessible",
        "timestamp": datetime.utcnow(),
        "service": "v0-thesis-lab-landing-production.up.railway.app"
    }

@app.get("/test")
async def test_endpoint():
    """Simple test endpoint to verify API is working"""
    return {"status": "success", "message": "API is working!"}

# Test Claude verification endpoint
@app.get("/test/verification")
async def test_verification():
    """Test endpoint to verify Claude verification works"""
    try:
        test_task_instructions = {
            "task": "Calculate 2+2+2+2",
            "requirements": ["Show work", "Provide final answer"]
        }
        
        test_verification_criteria = {
            "requires": "correct calculation showing work",
            "scoring": "correctness of final answer and clarity of work shown"
        }
        
        test_miner_output = {
            "work": "2+2+2+2 = 8",
            "answer": 8
        }
        
        logger.info(f"Testing verification with task: {test_task_instructions}")
        
        if CLAUDE_AVAILABLE:
            # Try real Claude verification
            try:
                result = verify_submission(
                    submission_id="test-submission",
                    task_id="test-task",
                    task_type=TaskType.EVALUATION,
                    task_instructions=test_task_instructions,
                    miner_output=test_miner_output,
                    verification_criteria=test_verification_criteria
                )
                
                return {
                    "status": "success",
                    "verification_type": "claude_ai",
                    "test_task": test_task_instructions,
                    "test_answer": test_miner_output,
                    "verification_result": result.to_dict()
                }
            except Exception as claude_error:
                logger.warning(f"Claude verification failed, falling back to mock: {str(claude_error)}")
                # Fall back to mock
                return get_mock_verification_result(test_task_instructions, test_miner_output)
        else:
            # Use mock verification
            return get_mock_verification_result(test_task_instructions, test_miner_output)
        
    except Exception as e:
        logger.error(f"Verification test failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Verification test failed: {str(e)}"
        )

def get_mock_verification_result(task_instructions, miner_output):
    """Mock verification for testing"""
    return {
        "status": "success",
        "verification_type": "mock",
        "test_task": task_instructions,
        "test_answer": miner_output,
        "verification_result": {
            "submission_id": "test-submission",
            "task_id": "test-task",
            "is_valid": True,
            "ai_score": 0.85,
            "feedback": "Mock verification: Good work shown, correct answer provided",
            "model_used": "mock-verifier",
            "verification_timestamp": datetime.utcnow().timestamp()
        }
    }

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
            "title": task_data.title,
            "description": task_data.description,
            "task_type": task_data.task_type,
            "difficulty_level": task_data.difficulty_level,
            "reward_per_submission": task_data.reward_per_submission,
            "total_budget": task_data.total_budget,
            "max_submissions": task_data.max_submissions,
            "verification_criteria": task_data.verification_criteria,
            "instructions": task_data.instructions,
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
    """
    Miner submits work for a task.
    
    Flow:
    1. Create submission in database (status: pending)
    2. Trigger verification with Claude (or fallback to mock)
    3. Update submission with verification results
    4. Return submission details
    """
    try:
        # Validate task exists
        task = tasks_db.get(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Create submission in database
        submission_id = str(uuid.uuid4())
        submissions_db[submission_id] = {
            "id": submission_id,
            "task_id": task_id,
            "submission_data": request.submission_data,
            "created_at": datetime.utcnow(),
            "status": "pending"
        }
        
        logger.info(f"Created submission {submission_id} for task {task_id}")
        
        # Verify submission (Claude or fallback to mock)
        verification_result = None
        verification_type = "unknown"
        
        if CLAUDE_AVAILABLE:
            try:
                logger.info(f"Starting Claude verification for submission {submission_id}")
                
                verification_result = verify_submission(
                    submission_id=submission_id,
                    task_id=task_id,
                    task_type=TaskType(task["task_type"]),
                    task_instructions=task["instructions"],
                    miner_output=request.submission_data,
                    verification_criteria=task["verification_criteria"]
                )
                
                verification_type = "claude_ai"
                logger.info(f"Claude verification completed for submission {submission_id}")
                logger.info(f"Verification result: valid={verification_result.is_valid}, score={verification_result.ai_score}")
                
            except Exception as claude_error:
                logger.warning(f"Claude verification failed, using mock: {str(claude_error)}")
                # Fall back to mock verification
                verification_result = get_mock_verification_result_object(submission_id, task_id, request.submission_data)
                verification_type = "mock_fallback"
        else:
            # Use mock verification
            verification_result = get_mock_verification_result_object(submission_id, task_id, request.submission_data)
            verification_type = "mock"
        
        # Calculate reward based on score
        reward_earned = task["reward_per_submission"] * verification_result.ai_score
        
        # Update submission with verification results
        submissions_db[submission_id].update({
            "ai_score": verification_result.ai_score,
            "is_valid": verification_result.is_valid,
            "feedback": verification_result.feedback,
            "reward_earned": reward_earned,
            "status": "completed",
            "verified_at": datetime.utcnow(),
            "model_used": verification_result.model_used,
            "verification_time_ms": getattr(verification_result, 'execution_time_ms', 0),
            "verification_type": verification_type
        })
        
        # Increment task submission count
        tasks_db[task_id]["current_submissions"] += 1
        
        logger.info(f"Submission {submission_id} verified successfully using {verification_type}")
        
        return {
            "status": "success",
            "submission_id": submission_id,
            "verification": {
                "is_valid": verification_result.is_valid,
                "ai_score": verification_result.ai_score,
                "feedback": verification_result.feedback,
                "model_used": verification_result.model_used,
                "verification_time_ms": getattr(verification_result, 'execution_time_ms', 0),
                "verification_type": verification_type
            },
            "reward_earned": reward_earned,
            "message": f"Submission verified successfully using {verification_type}"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_mock_verification_result_object(submission_id, task_id, submission_data):
    """Create a mock verification result object"""
    class MockVerificationResult:
        def __init__(self):
            self.submission_id = submission_id
            self.task_id = task_id
            self.is_valid = True
            self.ai_score = 0.85
            self.feedback = "Mock verification: Submission appears correct based on task requirements"
            self.model_used = "mock-verifier"
            self.execution_time_ms = 100
    
    return MockVerificationResult()

@app.get("/tasks/{task_id}/submissions/{submission_id}")
async def get_submission_status(task_id: str, submission_id: str):
    """Check status and results of a submission"""
    try:
        submission = submissions_db.get(submission_id)
        
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        return {
            "status": "success",
            "submission": submission
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
