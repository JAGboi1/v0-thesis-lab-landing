"""
Database Service Layer
Handles all database operations for tasks, submissions, users, etc.
"""

import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.db import get_supabase


class TaskService:
    """Handle all task-related database operations"""
    
    @staticmethod
    def create_task(
        title: str,
        description: str,
        task_type: str,
        difficulty_level: str,
        reward_per_submission: float,
        total_budget: float,
        verification_criteria: Dict[str, Any],
        instructions: Dict[str, Any],
        max_submissions: Optional[int] = None,
        developer_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new task in database.
        """
        db = get_supabase()
        
        task_id = str(uuid.uuid4())
        if not developer_id:
            developer_id = str(uuid.uuid4())
        
        task_data = {
            "id": task_id,
            "developer_id": developer_id,
            "title": title,
            "description": description,
            "task_type": task_type,
            "difficulty_level": difficulty_level,
            "reward_per_submission": reward_per_submission,
            "total_budget": total_budget,
            "verification_criteria": verification_criteria,
            "instructions": instructions,
            "max_submissions": max_submissions,
            "status": "active",
            "current_submissions": 0,
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Insert into database
        response = db.table("tasks").insert(task_data).execute()
        
        return response.data[0] if response.data else task_data
    
    @staticmethod
    def get_task(task_id: str) -> Optional[Dict[str, Any]]:
        """Get a task by ID"""
        db = get_supabase()
        
        response = db.table("tasks").select("*").eq("id", task_id).execute()
        
        return response.data[0] if response.data else None
    
    @staticmethod
    def list_active_tasks(limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """List all active tasks"""
        db = get_supabase()
        
        response = db.table("tasks").select("*").eq("status", "active").range(offset, offset + limit).execute()
        
        return response.data if response.data else []
    
    @staticmethod
    def update_task_submission_count(task_id: str):
        """Increment submission count for a task"""
        db = get_supabase()
        
        # Get current count
        task = db.table("tasks").select("current_submissions").eq("id", task_id).execute()
        if not task.data:
            return
        
        current = task.data[0]["current_submissions"]
        
        # Update count
        db.table("tasks").update({"current_submissions": current + 1}).eq("id", task_id).execute()


class UserService:
    """Handle all user (miner) related database operations"""
    
    @staticmethod
    def get_or_create_user(wallet_address: str, username: str = None) -> Dict[str, Any]:
        """
        Get user by wallet, or create if doesn't exist.
        """
        db = get_supabase()
        
        # Check if user exists
        response = db.table("users").select("*").eq("wallet_address", wallet_address).execute()
        
        if response.data:
            return response.data[0]
        
        # Create new user
        user_id = str(uuid.uuid4())
        if not username:
            username = f"miner_{wallet_address[:8]}"
        
        user_data = {
            "id": user_id,
            "wallet_address": wallet_address,
            "username": username,
            "reputation_score": 50,
            "total_tasks_completed": 0,
            "total_rewards_earned": 0,
            "created_at": datetime.utcnow().isoformat()
        }
        
        response = db.table("users").insert(user_data).execute()
        
        return response.data[0] if response.data else user_data
    
    @staticmethod
    def get_user_by_wallet(wallet_address: str) -> Optional[Dict[str, Any]]:
        """Get user by wallet address"""
        db = get_supabase()
        
        response = db.table("users").select("*").eq("wallet_address", wallet_address).execute()
        
        return response.data[0] if response.data else None
    
    @staticmethod
    def update_user_reputation(user_id: str, delta: int):
        """Add/subtract reputation points"""
        db = get_supabase()
        
        # Get current reputation
        user = db.table("users").select("reputation_score").eq("id", user_id).execute()
        if not user.data:
            return
        
        current_rep = user.data[0]["reputation_score"]
        new_rep = max(0, min(100, current_rep + delta))  # Clamp between 0-100
        
        # Update reputation
        db.table("users").update({"reputation_score": new_rep}).eq("id", user_id).execute()


class SubmissionService:
    """Handle all submission related database operations"""
    
    @staticmethod
    def create_submission(
        task_id: str,
        user_id: str,
        submission_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create a new submission in database.
        """
        db = get_supabase()
        
        submission_id = str(uuid.uuid4())
        
        submission_obj = {
            "id": submission_id,
            "task_id": task_id,
            "user_id": user_id,
            "submission_data": submission_data,
            "ai_score": None,
            "is_valid": None,
            "feedback": None,
            "reward_earned": 0,
            "is_paid": False,
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Insert into database
        response = db.table("submissions").insert(submission_obj).execute()
        
        return response.data[0] if response.data else submission_obj
    
    @staticmethod
    def get_submission(submission_id: str) -> Optional[Dict[str, Any]]:
        """Get a submission by ID"""
        db = get_supabase()
        
        response = db.table("submissions").select("*").eq("id", submission_id).execute()
        
        return response.data[0] if response.data else None
    
    @staticmethod
    def update_submission_verification(
        submission_id: str,
        ai_score: float,
        is_valid: bool,
        feedback: str,
        reward_earned: float = 0
    ):
        """Update submission with verification results"""
        db = get_supabase()
        
        update_data = {
            "ai_score": ai_score,
            "is_valid": is_valid,
            "feedback": feedback,
            "reward_earned": reward_earned
        }
        
        db.table("submissions").update(update_data).eq("id", submission_id).execute()
    
    @staticmethod
    def get_pending_submissions(limit: int = 50) -> List[Dict[str, Any]]:
        """Get all submissions that haven't been verified yet"""
        db = get_supabase()
        
        response = db.table("submissions").select("*").is_("is_valid", "null").limit(limit).execute()
        
        return response.data if response.data else []


class ReputationService:
    """Handle reputation events"""
    
    @staticmethod
    def create_reputation_event(
        user_id: str,
        event_type: str,
        reason: str,
        delta: int
    ):
        """Record a reputation event"""
        db = get_supabase()
        
        event_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "event_type": event_type,
            "reason": reason,
            "delta": delta,
            "created_at": datetime.utcnow().isoformat()
        }
        
        db.table("reputation_events").insert(event_data).execute()
        
        # Also update user's reputation score
        UserService.update_user_reputation(user_id, delta)
