const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface Task {
  id: string
  developer_id?: string
  title: string
  description: string
  task_type: string
  difficulty_level: string
  reward_per_submission: number
  total_budget: number
  verification_criteria: Record<string, any>
  instructions: Record<string, any>
  max_submissions?: number
  status: string
  current_submissions: number
  created_at: string
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

class ApiClient {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    console.log("[v0] API Request:", url, options)

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()
      console.log("[v0] API Response:", data)

      if (!response.ok) {
        throw new Error(data.detail || `HTTP ${response.status}`)
      }

      return data as T
    } catch (error) {
      console.error("[v0] API Error:", error)
      throw error
    }
  }

  // Task endpoints
  async createTask(taskData: {
    title: string
    description: string
    task_type: string
    difficulty_level: string
    reward_per_submission: number
    total_budget: number
    max_submissions?: number
    verification_criteria: Record<string, any>
    instructions: Record<string, any>
  }) {
    return this.request("/tasks/create", {
      method: "POST",
      body: JSON.stringify(taskData),
    })
  }

  async getTask(taskId: string): Promise<{ status: string; task: Task }> {
    return this.request(`/tasks/${taskId}`)
  }

  async listTasks(limit = 50, offset = 0): Promise<{ status: string; tasks: Task[]; total: number }> {
    return this.request(`/tasks?limit=${limit}&offset=${offset}`)
  }

  async submitInference(taskId: string, minerWallet: string, submissionData: Record<string, any>) {
    return this.request(`/tasks/${taskId}/submit`, {
      method: "POST",
      body: JSON.stringify({
        miner_wallet: minerWallet,
        submission_data: submissionData,
      }),
    })
  }

  async getSubmissionStatus(taskId: string, submissionId: string): Promise<{ status: string; submission: Submission }> {
    return this.request(`/tasks/${taskId}/submissions/${submissionId}`)
  }

  // User endpoints
  async getUserReputation(walletAddress: string): Promise<{
    status: string
    wallet: string
    reputation_score: number
    total_tasks_completed: number
    total_rewards_earned: number
  }> {
    return this.request(`/users/${walletAddress}/reputation`)
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request("/health")
  }
}

export const apiClient = new ApiClient()
