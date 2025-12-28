"use client"

import { useState, useEffect } from "react"
import { Zap, Users, Briefcase, CheckCircle, TrendingUp, Award, Code, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getTasks, type Task } from "@/lib/api"

const ThesisLabLanding = () => {
  const [activeFeature, setActiveFeature] = useState(0)
  const [animateHero, setAnimateHero] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState<string | null>(null)

  useEffect(() => {
    setAnimateHero(true)
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function loadTasks() {
      try {
        setTasksLoading(true)
        const data = await getTasks(4) // Get first 4 tasks
        setTasks(data)
        setTasksError(null)
      } catch (err) {
        console.error("[v0] Error loading tasks:", err)
        setTasksError(err instanceof Error ? err.message : "Failed to load tasks")
        // Fallback to empty array if backend fails
        setTasks([])
      } finally {
        setTasksLoading(false)
      }
    }
    loadTasks()
  }, [])

  const features = [
    {
      title: "For Builders",
      icon: <Code className="w-8 h-8" />,
      description: "Post AI evaluation tasks. Set token rewards. Get quality feedback at scale.",
      color: "from-cyan-400 to-teal-400",
    },
    {
      title: "For Evaluators",
      icon: <Award className="w-8 h-8" />,
      description: "Compete for limited slots. Earn real token upside. Build on-chain reputation.",
      color: "from-cyan-400 to-emerald-400",
    },
    {
      title: "Proof of Inference",
      icon: <Zap className="w-8 h-8" />,
      description: "Ritual verifies everything on-chain. Trustless. Transparent. Decentralized.",
      color: "from-teal-400 to-cyan-400",
    },
  ]

  const displayTasks = tasks.length > 0 ? tasks : []

  return (
    <div className="min-h-screen bg-[#040806] text-white overflow-hidden font-sans">
      {/* Halftone Dot Pattern Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, #142420 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-teal-900/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-cyan-900/30 to-transparent"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-8 py-6 flex items-center justify-between border-b border-cyan-900/30">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-cyan-400 rounded-2xl flex items-center justify-center">
            <span className="text-3xl font-black text-[#040806]">Θ</span>
          </div>
          <div>
            <div
              className="text-2xl font-black tracking-wider text-cyan-400"
              style={{ fontFamily: "Arial Black, sans-serif" }}
            >
              THESIS LAB
            </div>
            <div className="text-xs text-cyan-400/70 font-bold tracking-wide">PROOF OF INFERENCE MINING</div>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <a
            href="#builders"
            className="text-cyan-300/80 hover:text-cyan-400 transition font-bold text-sm tracking-wide"
          >
            BUILDERS
          </a>
          <a
            href="#evaluators"
            className="text-cyan-300/80 hover:text-cyan-400 transition font-bold text-sm tracking-wide"
          >
            EVALUATORS
          </a>
          <a href="#tasks" className="text-cyan-300/80 hover:text-cyan-400 transition font-bold text-sm tracking-wide">
            TASKS
          </a>
          <button className="px-6 py-2.5 bg-cyan-400 text-[#040806] rounded-lg font-black text-sm tracking-wide hover:bg-cyan-300 transition">
            LAUNCH APP
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-8 pt-32 pb-20 text-center">
        <div
          className={`transition-all duration-1000 ${animateHero ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="inline-flex items-center mb-6 px-4 py-2 bg-cyan-400/10 border-2 border-cyan-400/30 rounded-lg">
            <span className="text-sm font-black text-cyan-400 tracking-wider">POWERED BY RITUAL CHAIN</span>
          </div>
          <h1
            className="text-7xl font-black mb-6 text-cyan-400 tracking-tight"
            style={{ fontFamily: "Arial Black, sans-serif" }}
          >
            AI PROOF OF
            <br />
            INFERENCE MINING
          </h1>
          <p className="text-lg text-cyan-100/70 mb-8 max-w-2xl mx-auto font-semibold">
            Builders post AI tasks. Evaluators earn real token upside. All verified on-chain.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => document.getElementById("tasks")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3 bg-cyan-400 text-[#040806] rounded-lg font-black text-lg tracking-wide hover:bg-cyan-300 transition"
            >
              START MINING
            </button>
            <Link
              href="/builders"
              className="px-8 py-3 border-2 border-cyan-400 text-cyan-400 rounded-lg font-black text-lg tracking-wide hover:bg-cyan-400/10 transition"
            >
              POST TASK
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Stats */}
      <div className="mt-20 grid grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[
          { label: "ACTIVE TASKS", value: "127", icon: <Briefcase className="w-5 h-5" /> },
          { label: "TOTAL MINERS", value: "3,429", icon: <Users className="w-5 h-5" /> },
          { label: "EVALUATIONS", value: "45.2K", icon: <TrendingUp className="w-5 h-5" /> },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-6 bg-[#0a1109] border-2 border-cyan-400/30 rounded-2xl hover:border-cyan-400/60 transition"
          >
            <div className="flex items-center justify-center space-x-2 text-cyan-400 mb-2">
              {stat.icon}
              <span className="text-xs font-black tracking-wider">{stat.label}</span>
            </div>
            <div className="text-4xl font-black text-cyan-400">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Features Carousel */}
      <section className="relative z-10 px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-12">
            {features.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === activeFeature ? "w-16 bg-cyan-400" : "w-10 bg-cyan-400/30"
                }`}
              />
            ))}
          </div>

          <div className="relative h-96 overflow-hidden">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-700 ${
                  i === activeFeature
                    ? "opacity-100 translate-x-0"
                    : i < activeFeature
                      ? "opacity-0 -translate-x-full"
                      : "opacity-0 translate-x-full"
                }`}
              >
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-2xl">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-cyan-400/20 border-2 border-cyan-400/40 mb-6">
                      <div className="text-cyan-400">{feature.icon}</div>
                    </div>
                    <h2 className="text-5xl font-black mb-4 text-cyan-400 tracking-tight">
                      {feature.title.toUpperCase()}
                    </h2>
                    <p className="text-xl text-cyan-100/60 font-semibold">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Builders Section */}
      <section id="builders" className="relative z-10 px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <Code className="w-8 h-8 text-cyan-400 mr-3" />
              <h2 className="text-sm font-black text-cyan-400 tracking-widest">YOUR FAVORITE</h2>
            </div>
            <h2
              className="text-6xl font-black text-cyan-400 mb-4 tracking-tight"
              style={{ fontFamily: "Arial Black, sans-serif" }}
            >
              BUILDERS
            </h2>
            <p className="text-lg text-cyan-100/60 font-semibold">
              Post evaluation tasks. Get quality feedback. Pay in your tokens.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "POST TASKS",
                desc: "Define evaluation criteria for your AI models",
                icon: <Briefcase className="w-6 h-6" />,
              },
              {
                title: "SET REWARDS",
                desc: "Pay miners in your project tokens for upside alignment",
                icon: <Award className="w-6 h-6" />,
              },
              {
                title: "QUALITY CONTROL",
                desc: "Limited slots ensure only top evaluators participate",
                icon: <CheckCircle className="w-6 h-6" />,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group p-8 bg-[#0a1109] border-2 border-cyan-400/30 rounded-2xl hover:border-cyan-400/60 hover:bg-[#1a3530] transition cursor-pointer"
              >
                <div className="w-14 h-14 bg-cyan-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition text-[#040806]">
                  {item.icon}
                </div>
                <h3 className="text-lg font-black mb-2 text-cyan-400 tracking-wide">{item.title}</h3>
                <p className="text-cyan-100/60 text-sm font-semibold">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Evaluators Section */}
      <section id="evaluators" className="relative z-10 px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-cyan-400 mr-3" />
              <h2 className="text-sm font-black text-cyan-400 tracking-widest">YOUR FAVORITE</h2>
            </div>
            <h2
              className="text-6xl font-black text-cyan-400 mb-4 tracking-tight"
              style={{ fontFamily: "Arial Black, sans-serif" }}
            >
              EVALUATORS
            </h2>
            <p className="text-lg text-cyan-100/60 font-semibold">
              Mine AI inference. Earn token rewards. Build reputation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "COMPETE FOR SLOTS",
                desc: "Limited slots per task mean you're competing for quality, not just speed. Build your on-chain reputation to win access.",
                icon: <Users className="w-7 h-7" />,
              },
              {
                title: "REAL TOKEN UPSIDE",
                desc: "Earn project tokens instead of stablecoins. When the project grows, so does your reward. True alignment.",
                icon: <TrendingUp className="w-7 h-7" />,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group p-10 bg-[#0a1109] border-2 border-cyan-400/40 rounded-2xl hover:border-cyan-400/60 transition cursor-pointer"
              >
                <div className="w-16 h-16 bg-cyan-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition text-[#040806]">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-black mb-3 text-cyan-400 tracking-wide">{item.title}</h3>
                <p className="text-cyan-100/60 font-semibold">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tasks Section */}
      <section id="tasks" className="relative z-10 px-8 py-20 border-t border-cyan-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-black text-cyan-400 tracking-widest mb-3">LIVE</h2>
            <h3
              className="text-6xl font-black text-cyan-400 mb-4 tracking-tight"
              style={{ fontFamily: "Arial Black, sans-serif" }}
            >
              TASKS
            </h3>
            <p className="text-lg text-cyan-100/60 font-semibold">
              {displayTasks.length > 0 ? `${displayTasks.length} active evaluation mining tasks` : "Loading tasks..."}
            </p>
          </div>

          {tasksError && (
            <div className="mb-12 bg-cyan-400/10 border-2 border-cyan-400/40 rounded-2xl p-8 text-center">
              <p className="text-cyan-100/70 font-semibold">
                Cannot connect to backend. Make sure your FastAPI server is running at{" "}
                <code className="text-cyan-400 font-mono">
                  {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
                </code>
              </p>
            </div>
          )}

          {tasksLoading && (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-cyan-400 font-bold">Loading tasks from backend...</p>
            </div>
          )}

          {!tasksLoading && displayTasks.length === 0 && !tasksError && (
            <div className="bg-[#0a1411] border-2 border-cyan-400/30 rounded-2xl p-12 text-center">
              <p className="text-cyan-100/60 font-bold text-lg">No active tasks available yet</p>
              <Link
                href="/builders"
                className="mt-6 inline-block px-8 py-3 bg-cyan-400 text-[#040806] rounded-lg font-black tracking-wide hover:bg-cyan-300 transition"
              >
                BE THE FIRST TO POST A TASK
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayTasks.map((task, index) => (
              <div
                key={task.id}
                className="relative group bg-[#0a1411] border-2 border-cyan-400/40 rounded-2xl overflow-hidden hover:border-cyan-400/70 transition cursor-pointer p-6"
              >
                <div className="absolute top-4 right-4 bg-cyan-400 text-[#040806] px-4 py-2 rounded-lg font-black text-xl">
                  #{index + 1}
                </div>

                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-16 h-16 bg-cyan-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Code className="w-8 h-8 text-[#040806]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-2xl font-black text-cyan-400 mb-1 truncate">{task.title}</h4>
                    <span className="inline-flex items-center px-3 py-1 bg-cyan-400/20 text-cyan-400 text-xs font-black rounded-full border border-cyan-400/40">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse mr-2"></div>
                      {task.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="text-cyan-100/70 mb-4 font-semibold text-sm line-clamp-2">{task.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <div>
                    <div className="text-xs font-black text-cyan-400 tracking-widest mb-1">DIFFICULTY</div>
                    <div className="text-lg font-black text-cyan-400">{task.difficulty_level.toUpperCase()}</div>
                  </div>
                  <div>
                    <div className="text-xs font-black text-cyan-400 tracking-widest mb-1">REWARD</div>
                    <div className="text-lg font-black text-cyan-400">${task.reward_per_submission.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs font-black text-cyan-400 tracking-widest mb-1">SLOTS</div>
                    <div className="text-lg font-black text-cyan-400">
                      {task.current_submissions}/{task.max_submissions || "∞"}
                    </div>
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-cyan-400 text-[#040806] rounded-lg font-black tracking-wide hover:bg-cyan-300 transition">
                  VIEW DETAILS
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/tasks"
              className="inline-block px-8 py-3 border-2 border-cyan-400 text-cyan-400 rounded-lg font-black text-lg tracking-wide hover:bg-cyan-400/10 transition"
            >
              VIEW ALL TASKS <ArrowRight className="inline-block ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 px-8 py-20 text-center">
        <div className="max-w-4xl mx-auto p-16 bg-[#0a1109] border-2 border-cyan-400/40 rounded-3xl">
          <h2
            className="text-5xl font-black mb-6 text-cyan-400 tracking-tight"
            style={{ fontFamily: "Arial Black, sans-serif" }}
          >
            READY TO START?
          </h2>
          <p className="text-xl text-cyan-100/60 mb-8 font-semibold">
            Join THESIS Lab and be part of the decentralized AI evaluation revolution.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button className="px-8 py-4 bg-cyan-400 text-[#040806] rounded-lg text-lg font-black tracking-wide hover:bg-cyan-300 transition">
              LAUNCH APP
            </button>
            <button className="px-8 py-4 border-2 border-cyan-400/50 text-cyan-400 rounded-lg text-lg font-black tracking-wide hover:border-cyan-400 hover:bg-cyan-400/10 transition">
              READ DOCS
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-12 border-t-2 border-cyan-400/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cyan-400 rounded-xl flex items-center justify-center">
              <span className="text-xl font-black text-[#040806]">Θ</span>
            </div>
            <span className="text-sm text-cyan-400/60 font-bold">© 2025 THESIS LAB</span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-cyan-400/80 font-bold tracking-wide">
            <a href="#" className="hover:text-cyan-400 transition">
              DOCS
            </a>
            <a href="#" className="hover:text-cyan-400 transition">
              GITHUB
            </a>
            <a href="#" className="hover:text-cyan-400 transition">
              TWITTER
            </a>
            <a href="#" className="hover:text-cyan-400 transition">
              DISCORD
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ThesisLabLanding
