"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Code, Briefcase } from "lucide-react"
import { getTasks, type Task } from "@/lib/api"

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    try {
      setLoading(true)
      const data = await getTasks()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks")
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
            <div className="text-[10px] md:text-xs text-cyan-400/70 font-bold tracking-wide hidden sm:block">
              PROOF OF INFERENCE MINING
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-6">
          <button
            onClick={() => router.push("/builders")}
            className="text-cyan-300/80 hover:text-cyan-400 transition font-bold text-xs md:text-sm tracking-wide"
          >
            BUILDERS
          </button>
          <button
            onClick={() => router.push("/evaluators")}
            className="text-cyan-300/80 hover:text-cyan-400 transition font-bold text-xs md:text-sm tracking-wide"
          >
            EVALUATORS
          </button>
          <button className="px-3 md:px-6 py-2 md:py-2.5 bg-cyan-400 text-[#050a08] rounded-lg font-black text-xs md:text-sm tracking-wide hover:bg-cyan-300 transition">
            CONNECT
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center mb-3 md:mb-4">
            <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 mr-2 md:mr-3" />
            <h2 className="text-xs md:text-sm font-black text-cyan-400 tracking-widest">ACTIVE</h2>
          </div>
          <h1
            className="text-4xl md:text-6xl font-black text-cyan-400 mb-3 md:mb-4 tracking-tight"
            style={{ fontFamily: "Arial Black, sans-serif" }}
          >
            TASKS
          </h1>
          <p className="text-base md:text-lg text-cyan-100/60 font-semibold px-4">
            Browse and join available mining tasks
          </p>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-cyan-400 font-bold">Loading tasks...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border-2 border-red-500/40 rounded-2xl p-8 text-center">
            <p className="text-red-400 font-bold">{error}</p>
            <button
              onClick={loadTasks}
              className="mt-4 px-6 py-2 bg-cyan-400 text-[#050a08] rounded-lg font-black text-sm hover:bg-cyan-300 transition"
            >
              RETRY
            </button>
          </div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <div className="bg-[#0a1411] border-2 border-cyan-400/30 rounded-2xl p-12 text-center">
            <p className="text-cyan-100/60 font-bold text-lg">No active tasks available</p>
          </div>
        )}

        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className="relative group bg-[#0a1411] border-2 border-cyan-400/40 rounded-2xl overflow-hidden hover:border-cyan-400/70 transition cursor-pointer"
              onClick={() => router.push(`/tasks/${task.id}`)}
            >
              <div className="absolute top-4 md:top-6 right-4 md:right-6 bg-cyan-400 text-[#050a08] px-3 md:px-4 py-1 md:py-2 rounded-lg font-black text-lg md:text-2xl">
                #{index + 1}
              </div>

              <div className="p-4 md:p-8">
                <div className="flex items-center space-x-3 md:space-x-6 mb-4 md:mb-6">
                  <div className="w-14 h-14 md:w-20 md:h-20 bg-cyan-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Code className="w-7 h-7 md:w-10 md:h-10 text-[#050a08]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl md:text-3xl font-black text-cyan-400 mb-1 tracking-tight truncate">
                      {task.title}
                    </h3>
                    <span className="inline-flex items-center px-2 md:px-3 py-1 bg-cyan-400/20 text-cyan-400 text-[10px] md:text-xs font-black rounded-full border border-cyan-400/40">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-400 rounded-full animate-pulse mr-1 md:mr-2"></div>
                      {task.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="text-cyan-100/70 mb-4 md:mb-6 font-semibold text-sm md:text-base line-clamp-2">
                  {task.description}
                </p>

                <div className="grid grid-cols-3 gap-3 md:gap-6">
                  <div>
                    <div className="text-[10px] md:text-sm font-black text-cyan-400 tracking-widest mb-1 md:mb-2">
                      DIFFICULTY
                    </div>
                    <div className="text-base md:text-2xl font-black text-cyan-400">
                      {task.difficulty_level.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] md:text-sm font-black text-cyan-400 tracking-widest mb-1 md:mb-2">
                      REWARD
                    </div>
                    <div className="text-base md:text-2xl font-black text-cyan-400 truncate">
                      {task.reward_per_submission}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] md:text-sm font-black text-cyan-400 tracking-widest mb-1 md:mb-2">
                      SLOTS
                    </div>
                    <div className="text-base md:text-2xl font-black text-cyan-400">
                      {task.current_submissions}/{task.max_submissions || "∞"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t-2 border-cyan-400/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex items-center flex-wrap gap-2 md:gap-6 text-xs md:text-sm">
                    <span className="px-2 md:px-3 py-1 bg-cyan-400/20 text-cyan-400 font-bold rounded-lg">
                      {task.task_type}
                    </span>
                    <span className="text-cyan-400/80 font-bold">Budget: {task.total_budget}</span>
                  </div>
                  <button className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-cyan-400 text-[#050a08] rounded-lg font-black tracking-wide hover:bg-cyan-300 transition text-xs md:text-sm">
                    VIEW DETAILS
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
