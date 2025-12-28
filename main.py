from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any
from backend.claude_verification import verify_submission, TaskType
from backend.services import TaskService, UserService, SubmissionService, ReputationService
import uuid

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


class SubmitInferenceRequest(BaseModel):
    """Request to submit work for a task"""
    miner_wallet: str = Field(..., min_length=40, max_length=42)
    submission_data: Dict[str, Any]


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

@app.post("/tasks/create")
async def create_task(request: CreateTaskRequest):
    """
    Create a new mining task.
    
    Developers call this to post a task for miners to complete.
    """
    try:
        # Create task in database (no developer_id constraint)
        task = TaskService.create_task(
            title=request.title,
            description=request.description,
            task_type=request.task_type,
            difficulty_level=request.difficulty_level,
            reward_per_submission=request.reward_per_submission,
            total_budget=request.total_budget,
            verification_criteria=request.verification_criteria,
            instructions=request.instructions,
            max_submissions=request.max_submissions
        )
        
        return {
            "status": "success",
            "task": task
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/tasks/{task_id}")
async def get_task(task_id: str):
    """Get details of a specific task"""
    try:
        task = TaskService.get_task(task_id)
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return {
            "status": "success",
            "task": task
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/tasks")
async def list_tasks(limit: int = 50, offset: int = 0):
    """List all active tasks"""
    try:
        tasks = TaskService.list_active_tasks(limit=limit, offset=offset)
        
        return {
            "status": "success",
            "tasks": tasks,
            "total": len(tasks)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# SUBMISSION ENDPOINTS
# ============================================================================

@app.post("/tasks/{task_id}/submit")
async def submit_inference(task_id: str, request: SubmitInferenceRequest):
    """
    Miner submits work for a task.
    
    Flow:
    1. Create submission in database (status: pending)
    2. Trigger verification with Claude
    3. Update submission with verification results
    4. Update miner's reputation
    5. Return submission details
    """
    try:
        # Validate task exists
        task = TaskService.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Get or create user
        user = UserService.get_or_create_user(
            wallet_address=request.miner_wallet
        )
        
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
# TEST ENDPOINT (Keep for debugging)
# ============================================================================

@app.post("/test-verification")
async def test_verification():
    """Test endpoint to verify Claude verification works"""
    
    try:
        result = verify_submission(
            submission_id="test_sub_123",
            task_id="test_task_456",
            task_type=TaskType.CLASSIFICATION,
            task_instructions={
                "prompt": "Is this text about dogs or cats?",
                "options": ["dogs", "cats"]
            },
            miner_output="dogs",
            verification_criteria={
                "correct_answer": "dogs",
                "scoring": "Check if answer matches correct_answer"
            }
        )
        
        return {
            "status": "success",
            "verification": result.to_dict()
        }
    
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }
