// API utility functions to interact with FastAPI backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface Task {
  id: string
  developer_id: string
  title: string
  description: string
  task_type: "evaluation" | "prediction" | "code_execution" | "classification" | "annotation" | "human_review"
  difficulty_level: "easy" | "medium" | "hard"
  reward_per_submission: number
  total_budget: number
  verification_criteria: Record<string, any>
  instructions: Record<string, any>
  max_submissions: number | null
  status: string
  current_submissions: number
  created_at: string
}

export interface CreateTaskRequest {
  title: string
  description: string
  task_type: string
  difficulty_level: string
  reward_per_submission: number
  total_budget: number
  max_submissions?: number
  verification_criteria: Record<string, any>
  instructions: Record<string, any>
}

export interface SubmitInferenceRequest {
  miner_wallet: string
  submission_data: Record<string, any>
}

export interface VerificationResult {
  submission_id: string
  task_id: string
  is_valid: boolean
  ai_score: number
  feedback: string
  model_used: string
  verification_timestamp: number
  execution_time_ms: number
}

export interface Submission {
  id: string
  task_id: string
  user_id: string
  submission_data: Record<string, any>
  ai_score: number | null
  is_valid: boolean | null
  feedback: string | null
  reward_earned: number
  is_paid: boolean
  created_at: string
}

export interface User {
  id: string
  wallet_address: string
  username: string
  reputation_score: number
  total_tasks_completed: number
  total_rewards_earned: number
  created_at: string
}

// Task endpoints
export async function getTasks(limit = 50, offset = 0): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/tasks?limit=${limit}&offset=${offset}`)
  if (!response.ok) throw new Error("Failed to fetch tasks")
  const data = await response.json()
  console.log('Tasks API response:', data)
  return data.tasks
}

export async function getTask(taskId: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`)
  if (!response.ok) throw new Error("Failed to fetch task")
  const data = await response.json()
  return data.task
}

export async function createTask(taskData: CreateTaskRequest): Promise<Task> {
  console.log("[v0] Creating task at:", `${API_BASE_URL}/tasks/create`)
  console.log("[v0] Task data:", taskData)

  try {
    const response = await fetch(`${API_BASE_URL}/tasks/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    })

    console.log("[v0] Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Error response:", errorText)
      throw new Error(`Failed to create task: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] Response data:", data)
    return data.task
  } catch (err) {
    console.error("[v0] Fetch error:", err)
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new Error("Cannot connect to backend. Is the server running?")
    }
    throw err
  }
}

// Submission endpoints
export async function submitInference(
  taskId: string,
  submissionData: SubmitInferenceRequest,
): Promise<{ submission_id: string; verification: VerificationResult; reward_earned: number }> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submissionData),
  })
  if (!response.ok) throw new Error("Failed to submit inference")
  const data = await response.json()
  return data
}

export async function getSubmissionStatus(taskId: string, submissionId: string): Promise<Submission> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/submissions/${submissionId}`)
  if (!response.ok) throw new Error("Failed to fetch submission")
  const data = await response.json()
  return data.submission
}

// User endpoints
export async function getUserReputation(walletAddress: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${walletAddress}/reputation`)
  if (!response.ok) throw new Error("Failed to fetch user reputation")
  const data = await response.json()
  return data
}
