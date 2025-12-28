"""
Claude AI Verification Module for Ritual Mining Platform
Uses Anthropic's Claude API to verify miner submissions
"""

import os
import json
import time
from typing import Dict, Any
from dataclasses import dataclass
from enum import Enum
from anthropic import Anthropic


class TaskType(str, Enum):
    """Supported task types for verification"""
    EVALUATION = "evaluation"
    PREDICTION = "prediction"
    CODE_EXECUTION = "code_execution"
    CLASSIFICATION = "classification"
    ANNOTATION = "annotation"
    HUMAN_REVIEW = "human_review"


@dataclass
class VerificationResult:
    """Output format from Claude verification"""
    submission_id: str
    task_id: str
    is_valid: bool
    ai_score: float
    feedback: str
    model_used: str = "claude-3-5-sonnet-20241022"
    verification_timestamp: float = None
    execution_time_ms: int = 0

    def __post_init__(self):
        if self.verification_timestamp is None:
            self.verification_timestamp = time.time()

    def to_dict(self):
        """Convert to dictionary for JSON responses"""
        return {
            "submission_id": self.submission_id,
            "task_id": self.task_id,
            "is_valid": self.is_valid,
            "ai_score": self.ai_score,
            "feedback": self.feedback,
            "model_used": self.model_used,
            "verification_timestamp": self.verification_timestamp,
            "execution_time_ms": self.execution_time_ms,
        }


class ClaudeVerificationClient:
    """Client for verifying submissions using Claude API"""

    def __init__(self, api_key: str = None):
        """
        Initialize Claude verification client.
        """
        if api_key is None:
            api_key = os.getenv("CLAUDE_API_KEY")
        
        if not api_key:
            raise ValueError("CLAUDE_API_KEY not set in environment or passed as argument")
        
        self.client = Anthropic(api_key=api_key)
        self.model = "claude-3-5-sonnet-20241022"

    def verify_submission(
        self,
        submission_id: str,
        task_id: str,
        task_type: TaskType,
        task_instructions: Dict[str, Any],
        miner_output: Any,
        verification_criteria: Dict[str, Any],
        timeout_seconds: int = 30
    ) -> VerificationResult:
        """
        Verify a miner submission using Claude.
        """
        start_time = time.time()
        
        try:
            # Build the verification prompt
            prompt = self._build_verification_prompt(
                task_type=task_type,
                task_instructions=task_instructions,
                miner_output=miner_output,
                verification_criteria=verification_criteria
            )
            
            # Call Claude API
            message = self.client.messages.create(
                model=self.model,
                max_tokens=500,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            # Parse Claude's response
            response_text = message.content[0].text
            result = self._parse_claude_response(
                response_text=response_text,
                submission_id=submission_id,
                task_id=task_id
            )
            
            # Calculate execution time
            execution_time = int((time.time() - start_time) * 1000)
            result.execution_time_ms = execution_time
            
            # Verify we stayed within 30 seconds
            if execution_time > timeout_seconds * 1000:
                raise TimeoutError(
                    f"Verification took {execution_time}ms, exceeded {timeout_seconds}s limit"
                )
            
            return result
        
        except Exception as e:
            raise VerificationError(f"Verification failed: {str(e)}") from e

    def _build_verification_prompt(
        self,
        task_type: TaskType,
        task_instructions: Dict[str, Any],
        miner_output: Any,
        verification_criteria: Dict[str, Any]
    ) -> str:
        """Build the verification prompt for Claude"""
        
        instructions_str = json.dumps(task_instructions, indent=2)
        criteria_str = json.dumps(verification_criteria, indent=2)
        output_str = json.dumps(miner_output) if isinstance(miner_output, dict) else str(miner_output)
        
        prompt = f"""You are an AI verifier for a decentralized mining platform. Your job is to evaluate a miner's submission based on the task instructions and verification criteria.

TASK TYPE: {task_type.value}

TASK INSTRUCTIONS:
{instructions_str}

VERIFICATION CRITERIA (Scoring Rubric):
{criteria_str}

MINER'S SUBMISSION:
{output_str}

Please evaluate the miner's submission and respond in this exact JSON format:
{{
    "is_valid": true/false,
    "score": 0.0-1.0,
    "feedback": "Your detailed explanation here"
}}

Guidelines:
- is_valid: true if submission meets the criteria, false otherwise
- score: A decimal between 0.0 and 1.0 indicating quality/correctness
- feedback: Clear explanation of your evaluation

Respond ONLY with valid JSON, no additional text."""
        
        return prompt

    def _parse_claude_response(
        self,
        response_text: str,
        submission_id: str,
        task_id: str
    ) -> VerificationResult:
        """Parse Claude's response into VerificationResult"""
        
        try:
            # Extract JSON from response
            response_data = json.loads(response_text)
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract it
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                response_data = json.loads(json_match.group())
            else:
                raise VerificationError(f"Could not parse Claude response: {response_text}")
        
        return VerificationResult(
            submission_id=submission_id,
            task_id=task_id,
            is_valid=response_data.get("is_valid", False),
            ai_score=float(response_data.get("score", 0.0)),
            feedback=response_data.get("feedback", "No feedback provided"),
            model_used="claude-3-5-sonnet-20241022"
        )


# Standalone function for easy use in API routes
def verify_submission(
    submission_id: str,
    task_id: str,
    task_type: TaskType,
    task_instructions: Dict[str, Any],
    miner_output: Any,
    verification_criteria: Dict[str, Any],
    api_key: str = None
) -> VerificationResult:
    """
    High-level function to verify a miner submission using Claude.
    """
    client = ClaudeVerificationClient(api_key=api_key)
    return client.verify_submission(
        submission_id=submission_id,
        task_id=task_id,
        task_type=task_type,
        task_instructions=task_instructions,
        miner_output=miner_output,
        verification_criteria=verification_criteria
    )


# Custom Exceptions
class VerificationError(Exception):
    """Raised when verification fails"""
    pass
