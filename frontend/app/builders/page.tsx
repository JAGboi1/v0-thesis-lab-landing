"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Code, ArrowLeft } from "lucide-react"
import { createTask, type CreateTaskRequest } from "@/lib/api"

export default function BuildersPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: "",
    description: "",
    task_type: "evaluation",
    difficulty_level: "medium",
    reward_per_submission: 0,
    total_budget: 0,
    max_submissions: undefined,
    verification_criteria: {},
    instructions: {},
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    console.log("[v0] Attempting to create task with data:", formData)
    console.log("[v0] API URL:", process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")

    try {
      const result = await createTask(formData)
      console.log("[v0] Task created successfully:", result)
      setSuccess(true)
      setTimeout(() => router.push("/tasks"), 2000)
    } catch (err) {
      console.error("[v0] Error creating task:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create task"
      setError(
        `${errorMessage}. Make sure your backend is running on ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`,
      )
    } finally {
      setLoading(false)
    }
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
            <div
              className="text-lg md:text-2xl font-black tracking-wider text-cyan-400"
              style={{ fontFamily: "Arial Black, sans-serif" }}
            >
              THESIS LAB
            </div>
            <div className="text-[10px] md:text-xs text-cyan-400/70 font-bold tracking-wide">
              PROOF OF INFERENCE MINING
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push("/")}
          className="flex items-center space-x-1 md:space-x-2 text-cyan-300/80 hover:text-cyan-400 transition font-bold text-xs md:text-sm tracking-wide"
        >
          <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
          <span>BACK</span>
        </button>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center mb-3 md:mb-4">
            <Code className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 mr-2 md:mr-3" />
            <h2 className="text-xs md:text-sm font-black text-cyan-400 tracking-widest">FOR BUILDERS</h2>
          </div>
          <h1
            className="text-4xl md:text-6xl font-black text-cyan-400 mb-3 md:mb-4 tracking-tight"
            style={{ fontFamily: "Arial Black, sans-serif" }}
          >
            CREATE TASK
          </h1>
          <p className="text-base md:text-lg text-cyan-100/60 font-semibold px-4">
            Post evaluation tasks and get quality feedback
          </p>
        </div>

        {success ? (
          <div className="bg-cyan-400/10 border-2 border-cyan-400/40 rounded-2xl p-8 md:p-12 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <Code className="w-8 h-8 md:w-10 md:h-10 text-[#050a08]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-cyan-400 mb-3 md:mb-4">TASK CREATED!</h2>
            <p className="text-cyan-100/60 font-semibold text-sm md:text-base">Redirecting to tasks marketplace...</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-[#0a1411] border-2 border-cyan-400/40 rounded-2xl p-4 md:p-8 space-y-4 md:space-y-6"
          >
            {error && (
              <div className="bg-red-500/10 border-2 border-red-500/40 rounded-lg p-4">
                <p className="text-red-400 font-bold text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-black text-cyan-400 tracking-widest mb-2">TITLE</label>
              <input
                type="text"
                required
                minLength={5}
                maxLength={200}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-[#050a08] border-2 border-cyan-400/30 rounded-lg text-cyan-50 font-semibold focus:border-cyan-400 focus:outline-none"
                placeholder="e.g., Evaluate ChatAI Pro responses"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-cyan-400 tracking-widest mb-2">DESCRIPTION</label>
              <textarea
                required
                minLength={20}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-[#050a08] border-2 border-cyan-400/30 rounded-lg text-cyan-50 font-semibold focus:border-cyan-400 focus:outline-none"
                placeholder="Detailed description of the evaluation task..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-black text-cyan-400 tracking-widest mb-2">TASK TYPE</label>
                <select
                  value={formData.task_type}
                  onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                  className="w-full px-4 py-3 bg-[#050a08] border-2 border-cyan-400/30 rounded-lg text-cyan-50 font-semibold focus:border-cyan-400 focus:outline-none"
                >
                  <option value="evaluation">Evaluation</option>
                  <option value="prediction">Prediction</option>
                  <option value="classification">Classification</option>
                  <option value="annotation">Annotation</option>
                  <option value="code_execution">Code Execution</option>
                  <option value="human_review">Human Review</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-cyan-400 tracking-widest mb-2">DIFFICULTY</label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                  className="w-full px-4 py-3 bg-[#050a08] border-2 border-cyan-400/30 rounded-lg text-cyan-50 font-semibold focus:border-cyan-400 focus:outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-black text-cyan-400 tracking-widest mb-2">
                  REWARD PER SUBMISSION
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={Number.isNaN(formData.reward_per_submission) ? "" : formData.reward_per_submission}
                  onChange={(e) =>
                    setFormData({ ...formData, reward_per_submission: Number.parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 bg-[#050a08] border-2 border-cyan-400/30 rounded-lg text-cyan-50 font-semibold focus:border-cyan-400 focus:outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-cyan-400 tracking-widest mb-2">TOTAL BUDGET</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={Number.isNaN(formData.total_budget) ? "" : formData.total_budget}
                  onChange={(e) => setFormData({ ...formData, total_budget: Number.parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-[#050a08] border-2 border-cyan-400/30 rounded-lg text-cyan-50 font-semibold focus:border-cyan-400 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-cyan-400 tracking-widest mb-2">
                MAX SUBMISSIONS (Optional)
              </label>
              <input
                type="number"
                min="1"
                value={formData.max_submissions || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_submissions: e.target.value ? Number.parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full px-4 py-3 bg-[#050a08] border-2 border-cyan-400/30 rounded-lg text-cyan-50 font-semibold focus:border-cyan-400 focus:outline-none"
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-cyan-400 tracking-widest mb-2">
                VERIFICATION CRITERIA (JSON)
              </label>
              <textarea
                required
                value={JSON.stringify(formData.verification_criteria, null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({ ...formData, verification_criteria: JSON.parse(e.target.value) })
                  } catch {}
                }}
                rows={4}
                className="w-full px-4 py-3 bg-[#050a08] border-2 border-cyan-400/30 rounded-lg text-cyan-50 font-mono text-sm focus:border-cyan-400 focus:outline-none"
                placeholder='{"scoring": "Rate responses 1-5", "criteria": ["accuracy", "clarity"]}'
              />
            </div>

            <div>
              <label className="block text-sm font-black text-cyan-400 tracking-widest mb-2">INSTRUCTIONS (JSON)</label>
              <textarea
                required
                value={JSON.stringify(formData.instructions, null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({ ...formData, instructions: JSON.parse(e.target.value) })
                  } catch {}
                }}
                rows={4}
                className="w-full px-4 py-3 bg-[#050a08] border-2 border-cyan-400/30 rounded-lg text-cyan-50 font-mono text-sm focus:border-cyan-400 focus:outline-none"
                placeholder='{"prompt": "Evaluate AI responses", "examples": []}'
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 md:px-8 py-3 md:py-4 bg-cyan-400 text-[#050a08] rounded-lg font-black text-base md:text-lg tracking-wide hover:bg-cyan-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "CREATING TASK..." : "CREATE TASK"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
