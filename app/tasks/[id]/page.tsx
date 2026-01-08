"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Code, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { getTask, submitInference, type Task, type SubmitInferenceRequest } from "@/lib/api"

export default function TaskDetailPage() {
  const router = useRouter()
  const { id: taskId } = useParams()
  const taskIdString = taskId as string
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean
    message: string
    submissionId?: string
    rewardEarned?: number
  } | null>(null)

  // Load task details
  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true)
        const data = await getTask(taskIdString)
        setTask(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load task")
      } finally {
        setLoading(false)
      }
    }

    if (!taskIdString) {
      setError('Task ID is missing')
      setLoading(false)
      return
    }
    
    loadTask()
  }, [taskIdString])

  // Connect wallet
  const connectWallet = async () => {
    try {
      // @ts-ignore - ethereum is injected by wallet extensions
      if (window.ethereum) {
        // @ts-ignore
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0])
        }
      } else {
        setError("Please install MetaMask or another Web3 wallet")
      }
    } catch (err) {
      setError("Failed to connect wallet")
      console.error(err)
    }
  }

  // Handle task submission
  const handleSubmitTask = async () => {
    if (!walletAddress) {
      setError("Please connect your wallet first")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      
      // This is a placeholder for actual task completion data
      // You'll need to implement the actual task UI based on task type
      const submissionData = {
        // Add actual submission data based on task type
        // This is just a placeholder
        answer: "Sample submission data"
      }

      const result = await submitInference(taskIdString, {
        miner_wallet: walletAddress,
        submission_data: submissionData
      })

      setSubmissionResult({
        success: true,
        message: "Task submitted successfully!",
        submissionId: result.submission_id,
        rewardEarned: result.reward_earned
      })
    } catch (err) {
      console.error("Submission error:", err)
      setError(err instanceof Error ? err.message : "Failed to submit task")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050a08] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050a08] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-[#0a1411] border-2 border-red-400/40 rounded-2xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-red-400 mb-4">Error Loading Task</h2>
          <p className="text-cyan-100/70 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-cyan-400 text-[#050a08] rounded-lg font-black hover:bg-cyan-300 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[#050a08] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-[#0a1411] border-2 border-cyan-400/40 rounded-2xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-cyan-400 mb-4">Task Not Found</h2>
          <p className="text-cyan-100/70 mb-6">The requested task could not be found or has been removed.</p>
          <button
            onClick={() => router.push('/tasks')}
            className="px-6 py-3 bg-cyan-400 text-[#050a08] rounded-lg font-black hover:bg-cyan-300 transition"
          >
            Browse Tasks
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050a08] text-cyan-50">
      {/* Header */}
      <nav className="relative z-50 px-4 md:px-8 py-4 md:py-6 flex items-center justify-between border-b border-cyan-900/30">
        <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-400 rounded-2xl flex items-center justify-center">
            <span className="text-2xl md:text-3xl font-black text-[#050a08]">Θ</span>
          </div>
          <div>
            <div className="text-lg md:text-2xl font-black tracking-wider text-cyan-400" style={{ fontFamily: "Arial Black, sans-serif" }}>
              THESIS LAB
            </div>
            <div className="text-[10px] md:text-xs text-cyan-400/70 font-bold tracking-wide hidden sm:block">
              PROOF OF INFERENCE MINING
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {!walletAddress ? (
            <button
              onClick={connectWallet}
              className="px-4 md:px-6 py-2 md:py-3 bg-cyan-400 text-[#050a08] rounded-lg font-black hover:bg-cyan-300 transition text-sm md:text-base"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="px-4 py-2 bg-cyan-400/20 text-cyan-400 rounded-lg font-mono text-xs md:text-sm truncate max-w-[180px] md:max-w-xs">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-6xl">
        <button
          onClick={() => router.back()}
          className="flex items-center text-cyan-400 hover:text-cyan-300 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Tasks
        </button>

        <div className="bg-[#0a1411] border-2 border-cyan-400/40 rounded-2xl overflow-hidden">
          {/* Task Header */}
          <div className="p-6 md:p-8 border-b border-cyan-400/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="px-3 py-1 bg-cyan-400/20 text-cyan-400 text-xs font-bold rounded-lg">
                    {task.task_type.toUpperCase()}
                  </span>
                  <span className="text-cyan-400/80 text-sm font-bold">
                    Difficulty: {task.difficulty_level.toUpperCase()}
                  </span>
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-cyan-400 mb-2">
                  {task.title}
                </h1>
                <p className="text-cyan-100/70">{task.description}</p>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <div className="text-cyan-400/80 text-sm mb-1">Reward per submission</div>
                <div className="text-2xl font-black text-cyan-400">{task.reward_per_submission} ETH</div>
                <div className="text-cyan-400/60 text-xs mt-1">
                  {task.current_submissions}/{task.max_submissions || '∞'} submissions
                </div>
              </div>
            </div>
          </div>

          {/* Task Content */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 gap-8">
              {/* Task Instructions */}
              <div className="space-y-6">
                <div className="bg-[#0c1a16] border border-cyan-400/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center">
                    <Code className="w-5 h-5 mr-2" />
                    Task Instructions
                  </h3>
                  <div className="prose prose-invert max-w-none">
                    {task.instructions && typeof task.instructions === 'object' ? (
                      <div className="space-y-4">
                        {Object.entries(task.instructions).map(([key, value]) => (
                          <div key={key}>
                            <h4 className="font-bold text-cyan-300">{key}</h4>
                            <p className="text-cyan-100/80">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-cyan-100/80">
                        {typeof task.instructions === 'string' 
                          ? task.instructions 
                          : 'No specific instructions provided. Please complete the task to the best of your ability.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Task Input Area - This should be customized based on task type */}
                <div className="bg-[#0c1a16] border border-cyan-400/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-cyan-400 mb-4">Your Submission</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-cyan-300 mb-1">
                        Your Answer
                      </label>
                      <textarea
                        className="w-full bg-[#0a1411] border border-cyan-400/30 rounded-lg p-3 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                        rows={6}
                        placeholder="Enter your response here..."
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleSubmitTask}
                        disabled={!walletAddress || isSubmitting}
                        className={`px-6 py-3 rounded-lg font-black transition ${
                          walletAddress 
                            ? 'bg-cyan-400 text-[#050a08] hover:bg-cyan-300' 
                            : 'bg-cyan-400/30 text-cyan-400/50 cursor-not-allowed'
                        }`}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </span>
                        ) : (
                          'Submit Task'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Info Sidebar */}
              <div className="space-y-6">

                {/* Task Stats */}
                <div className="bg-[#0c1a16] border border-cyan-400/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-cyan-400 mb-4">Task Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-cyan-100/70">Status</span>
                      <span className="font-medium text-cyan-400">{task.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-100/70">Submissions</span>
                      <span className="font-medium">
                        {task.current_submissions}{task.max_submissions ? ` / ${task.max_submissions}` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-100/70">Reward</span>
                      <span className="font-medium text-cyan-400">{task.reward_per_submission} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-100/70">Budget Remaining</span>
                      <span className="font-medium">
                        {task.total_budget - (task.current_submissions * task.reward_per_submission)} ETH
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Success Modal */}
      {submissionResult?.success && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a1411] border-2 border-green-400/50 rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-black text-green-400 mb-2">Task Submitted!</h3>
              <p className="text-cyan-100/80 mb-6">
                Your submission has been received and is being verified.
              </p>
              <div className="bg-[#0c1a16] border border-green-400/30 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-cyan-100/70">Submission ID:</span>
                  <span className="font-mono text-sm">{submissionResult.submissionId?.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-100/70">Reward Earned:</span>
                  <span className="text-green-400 font-bold">{submissionResult.rewardEarned} ETH</span>
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    setSubmissionResult(null)
                    router.push('/tasks')
                  }}
                  className="px-6 py-3 bg-cyan-400 text-[#050a08] rounded-lg font-black hover:bg-cyan-300 transition"
                >
                  Back to Tasks
                </button>
                <button
                  onClick={() => setSubmissionResult(null)}
                  className="px-6 py-3 border border-cyan-400/30 text-cyan-400 rounded-lg font-medium hover:bg-cyan-400/10 transition"
                >
                  Submit Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
