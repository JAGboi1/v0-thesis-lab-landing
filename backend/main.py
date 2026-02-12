from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any
from claude_verification import verify_submission, TaskType
from services import TaskService, UserService, SubmissionService, ReputationService
from auth import get_current_user, get_current_user_optional
import uuid
import logging

#configure logging
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


# ============================================================================
# PYDANTIC MODELS (Request/Response schemas)
# ============================================================================

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

class TaskCreate(BaseModel):
    title: str
    description: str
    task_type: str
    difficulty_level: str
    reward_per_submission: float
    total_budget: float
    max_submissions: Optional[int] = None
    verification_criteria: Optional[dict] = None
    instructions: Optional[dict] = None

    # Task creation endpoint
@app.post("/tasks/create")
async def create_task(task_data: TaskCreate):
    try:
        logger.info(f"Creating task with data: {task_data.dict()}")
        
        # Here you would typically save the task to your database
        # For now, we'll just return a success response
        task_id = str(uuid.uuid4())
        
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

class SubmitInferenceRequest(BaseModel):
    """Request to submit work for a task"""
    submission_data: Dict[str, Any]


# ============================================================================
# TEST ENDPOINT
# ============================================================================

@app.get("/test")
async def test_endpoint():
    """Simple test endpoint to verify API is working"""
    return {"status": "success", "message": "API is working!"}


# ============================================================================
# BASIC ENDPOINTS
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.utcnow()}


# ============================================================================
# TASK ENDPOINTS
# ============================================================================

from fastapi.dependencies import Depends

@app.post("/tasks/create")
async def create_task(
    request: CreateTaskRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new mining task.
    
    Developers call this to post a task for miners to complete.
    Requires authentication.
    """
    try:
        # Create task in database with the authenticated user's wallet address
        task = TaskService.create_task(
            title=request.title,
            description=request.description,
            task_type=request.task_type,
            difficulty_level=request.difficulty_level,
            reward_per_submission=request.reward_per_submission,
            total_budget=request.total_budget,
            verification_criteria=request.verification_criteria,
            instructions=request.instructions,
            max_submissions=request.max_submissions,
            developer_id=current_user["wallet_address"]
        )
        
        return {
            "status": "success",
            "task": task
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create task")


@app.get("/tasks/{task_id}")
async def get_task(task_id: str):
    """Get details of a specific task"""
    try:
        # Get task using the static method
        task = TaskService.get_task(task_id)
        
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


@app.get("/tasks")
async def list_tasks(limit: int = 50, offset: int = 0):
    """List all active tasks with pagination"""
    try:
        # Get tasks using the static method
        tasks = TaskService.list_active_tasks(limit=limit, offset=offset)
        
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


# ============================================================================
# SUBMISSION ENDPOINTS
# ============================================================================

@app.post("/tasks/{task_id}/submit")
async def submit_inference(
    task_id: str, 
    request: SubmitInferenceRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Miner submits work for a task.
    
    Flow:
    1. Create submission in database (status: pending)
    2. Trigger verification with Claude
    3. Update submission with verification results
    4. Update user's reputation
    5. Return submission details
    
    Requires authentication.
    """
    try:
        # Validate task exists
        task = TaskService.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Get user from JWT token
        user = current_user
        wallet_address = user["wallet_address"]
        
        # Create submission in database
        submission = SubmissionService.create_submission(
            task_id=task_id,
            user_id=user["id"],
            submission_data=request.submission_data
        )
        
        # Verify submission with Claude
        try:
            verification_result = verify_submission(
                submission_id=submission["id"],
                task_id=task_id,
                task_type=TaskType(task["task_type"]),
                task_instructions=task["instructions"],
                miner_output=request.submission_data,
                verification_criteria=task["verification_criteria"]
            )
            
            # Calculate reward based on score
            reward_earned = task["reward_per_submission"] * verification_result.ai_score
            
            # Update submission with verification results
            SubmissionService.update_submission_verification(
                submission_id=submission["id"],
                ai_score=verification_result.ai_score,
                is_valid=verification_result.is_valid,
                feedback=verification_result.feedback,
                reward_earned=reward_earned
            )
            
            # Update reputation based on result
            if verification_result.is_valid:
                reputation_delta = 5  # +5 for correct submission
                event_type = "submission_accepted"
            else:
                reputation_delta = -2  # -2 for incorrect submission
                event_type = "submission_rejected"
            
            ReputationService.create_reputation_event(
                user_id=user["id"],
                event_type=event_type,
                reason=verification_result.feedback,
                delta=reputation_delta
            )
            
            # Increment task submission count
            TaskService.update_task_submission_count(task_id)
            
            return {
                "status": "success",
                "submission_id": submission["id"],
                "verification": verification_result.to_dict(),
                "reward_earned": reward_earned
            }
        
        except Exception as e:
            # Verification failed, still save submission but mark as failed
            SubmissionService.update_submission_verification(
                submission_id=submission["id"],
                ai_score=0.0,
                is_valid=False,
                feedback=f"Verification error: {str(e)}",
                reward_earned=0.0
            )
            
            ReputationService.create_reputation_event(
                user_id=user["id"],
                event_type="submission_rejected",
                reason="Verification failed",
                delta=-1
            )
            
            raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/tasks/{task_id}/submissions/{submission_id}")
async def get_submission_status(task_id: str, submission_id: str):
    """Check the status and results of a submission"""
    try:
        submission = SubmissionService.get_submission(submission_id)
        
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


# ============================================================================
# USER/MINER ENDPOINTS
# ============================================================================

@app.get("/users/{wallet_address}/reputation")
async def get_miner_reputation(wallet_address: str):
    """Get miner's reputation score and stats"""
    try:
        user = UserService.get_user_by_wallet(wallet_address)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "status": "success",
            "wallet": wallet_address,
            "reputation_score": user["reputation_score"],
            "total_tasks_completed": user["total_tasks_completed"],
            "total_rewards_earned": user["total_rewards_earned"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# TEST ENDPOINTS (Keep for debugging)
# ============================================================================

@app.get("/debug/tasks")
async def debug_tasks(limit: int = 5, offset: int = 0):
    """Debug endpoint to test task fetching"""
    try:
        logger.info(f"Debug: Fetching {limit} tasks with offset {offset}")
        
        # Get tasks using the static method
        tasks = TaskService.list_active_tasks(limit=limit, offset=offset)
        
        return {
            "status": "success",
            "tasks_count": len(tasks),
            "tasks": tasks,
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        import traceback
        error_details = {
            "status": "error",
            "error_type": type(e).__name__,
            "error_message": str(e),
            "traceback": traceback.format_exc()
        }
        logger.error(f"Debug endpoint error: {error_details}")
        return error_details

@app.get("/test/verification")
async def test_verification():
    """Test endpoint to verify Claude verification works"""
    try:
        test_prompt = "What is the capital of France?"
        test_answer = "Paris"
        
        logger.info(f"Testing verification with prompt: {test_prompt}")
        
        result = verify_submission(
            task_type=TaskType.EVALUATION,
            prompt=test_prompt,
            submission=test_answer,
            criteria={"requires": "exact match to 'Paris'"}
        )
        
        return {
            "status": "success",
            "test_prompt": test_prompt,
            "test_answer": test_answer,
            "verification_result": result.dict()
        }
        
    except Exception as e:
        logger.error(f"Verification test failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Verification test failed: {str(e)}"
        )