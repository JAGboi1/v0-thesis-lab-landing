"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"
import { submitInference } from "@/lib/api"

interface TaskSubmissionProps {
  taskId: string
  walletAddress: string
  onVerificationComplete: (result: any) => void
}

export function TaskSubmission({ taskId, walletAddress, onVerificationComplete }: TaskSubmissionProps) {
  const [answer, setAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<{
    status: 'idle' | 'verifying' | 'verified' | 'error'
    score?: number
    feedback?: string
  }>({ status: 'idle' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim()) {
      setError("Please enter your answer")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      setVerificationStatus({ status: 'verifying' })

      const result = await submitInference(taskId, {
        miner_wallet: walletAddress,
        submission_data: { answer }
      })

      setVerificationStatus({
        status: 'verified',
        score: result.verification.ai_score,
        feedback: result.verification.feedback
      })

      onVerificationComplete({
        success: result.verification.is_valid,
        message: "Task submitted successfully!",
        submissionId: result.submission_id,
        rewardEarned: result.reward_earned,
        verification: result.verification
      })
    } catch (err) {
      console.error("Submission error:", err)
      setError(err instanceof Error ? err.message : "Failed to verify answer")
      setVerificationStatus({ status: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="answer" className="block text-sm font-medium mb-2">
            Your Answer
          </label>
          <textarea
            id="answer"
            rows={6}
            className="w-full px-3 py-2 border rounded-md"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isSubmitting}
            placeholder="Type your answer here..."
          />
          <div className="text-xs text-gray-500 mt-1">
            {answer.length}/1000 characters
          </div>
        </div>

        {error && (
          <div className="flex items-center text-red-500 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !answer.trim()}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isSubmitting || !answer.trim()
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Verifying...
            </span>
          ) : (
            'Submit Answer'
          )}
        </button>
      </form>

      {verificationStatus.status === 'verifying' && (
        <div className="flex items-center text-blue-600">
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
          VERIFYING WITH AI...
        </div>
      )}

      {verificationStatus.status === 'verified' && (
        <div className="p-4 rounded-md bg-green-50">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-sm font-medium text-green-800">
              Verification Complete
            </h3>
          </div>
          <div className="mt-2 text-sm text-green-700">
            <p>Score: {verificationStatus.score}%</p>
            <p className="mt-1">{verificationStatus.feedback}</p>
          </div>
        </div>
      )}

      {verificationStatus.status === 'error' && (
        <div className="flex items-center text-red-500">
          <XCircle className="h-5 w-5 mr-2" />
          <span>Failed to verify answer. Please try again.</span>
        </div>
      )}
    </div>
  )
}
