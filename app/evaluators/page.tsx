"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, Award, TrendingUp, Wallet, LogOut, Briefcase, Clock, CheckCircle } from "lucide-react"

export default function EvaluatorsPage() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [reputation, setReputation] = useState<any>(null)
  const [activeTasks, setActiveTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Mock wallet connection
  const connectWallet = () => {
    const mockWallet = "0x" + Math.random().toString(16).substring(2, 42)
    setWalletAddress(mockWallet)
    localStorage.setItem("wallet", mockWallet)
    fetchUserData(mockWallet)
  }

  const disconnectWallet = () => {
    setWalletAddress(null)
    setReputation(null)
    setActiveTasks([])
    localStorage.removeItem("wallet")
  }

  const fetchUserData = async (wallet: string) => {
    try {
      setLoading(true)
      
      // Fetch reputation
      const repResponse = await fetch(`http://localhost:8000/users/${wallet}/reputation`)
      if (repResponse.ok) {
        const repData = await repResponse.json()
        setReputation(repData)
      }

      // Fetch active tasks (mock for now - you'll need to add this endpoint)
      // const tasksResponse = await fetch(`http://localhost:8000/users/${wallet}/submissions`)
      // For now, using mock data
      setActiveTasks([
        {
          id: "1",
          title: "Evaluate ChatAI Pro",
          status: "in_progress",
          reward: "5,000 CHAT",
          progress: 3,
          total: 10,
          deadline: "2h 30m"
        }
      ])

    } catch (error) {
      console.error("Failed to fetch user data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const savedWallet = localStorage.getItem("wallet")
    if (savedWallet) {
      setWalletAddress(savedWallet)
      fetchUserData(savedWallet)
    } else {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050a08] flex items-center justify-center">
        <div className="text-cyan-400 font-black text-xl">LOADING...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050a08] text-white">
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
            <div className="text-[10px] md:text-xs text-cyan-400/70 font-bold tracking-wide">PROOF OF INFERENCE MINING</div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {walletAddress ? (
            <>
              <div className="hidden md:block px-4 py-2 bg-cyan-400/20 border border-cyan-400/40 rounded-lg">
                <span className="text-xs font-black text-cyan-400">
                  {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                </span>
              </div>
              <button
                onClick={disconnectWallet}
                className="flex items-center space-x-2 px-4 py-2 border border-cyan-400/50 text-cyan-400 rounded-lg font-bold text-sm hover:bg-cyan-400/10 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>DISCONNECT</span>
              </button>
            </>
          ) : (
            <button
              onClick={connectWallet}
              className="flex items-center space-x-2 px-6 py-2.5 bg-cyan-400 text-[#050a08] rounded-lg font-black text-sm tracking-wide hover:bg-cyan-300 transition"
            >
              <Wallet className="w-4 h-4" />
              <span>CONNECT WALLET</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        {!walletAddress ? (
          // Not Connected State
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-cyan-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-12 h-12 text-cyan-400" />
            </div>
            <h2 className="text-4xl font-black text-cyan-400 mb-4" style={{ fontFamily: "Arial Black, sans-serif" }}>
              CONNECT YOUR WALLET
            </h2>
            <p className="text-cyan-100/60 text-lg mb-8 max-w-md mx-auto">
              Connect your wallet to start mining evaluations and earning rewards
            </p>
            <button
              onClick={connectWallet}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-cyan-400 text-[#050a08] rounded-lg font-black text-lg tracking-wide hover:bg-cyan-300 transition"
            >
              <Wallet className="w-5 h-5" />
              <span>CONNECT WALLET</span>
            </button>
          </div>
        ) : (
          // Connected State
          <div className="space-y-8">
            {/* Profile Stats */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-cyan-400 mr-3" />
                <h2 className="text-sm font-black text-cyan-400 tracking-widest">EVALUATOR PROFILE</h2>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-cyan-400 mb-4 tracking-tight" style={{ fontFamily: "Arial Black, sans-serif" }}>
                DASHBOARD
              </h1>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-8 bg-[#0a1411] border-2 border-cyan-400/40 rounded-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-cyan-400 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-[#050a08]" />
                  </div>
                  <span className="text-sm font-black text-cyan-400 tracking-wider">REPUTATION</span>
                </div>
                <div className="text-5xl font-black text-cyan-400 mb-2">
                  {reputation?.reputation_score || 50}
                </div>
                <div className="text-sm text-cyan-100/60 font-semibold">
                  {reputation?.reputation_score >= 80 ? "Elite Miner" : reputation?.reputation_score >= 60 ? "Experienced" : "Beginner"}
                </div>
              </div>

              <div className="p-8 bg-[#0a1411] border-2 border-cyan-400/40 rounded-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-cyan-400 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-[#050a08]" />
                  </div>
                  <span className="text-sm font-black text-cyan-400 tracking-wider">COMPLETED</span>
                </div>
                <div className="text-5xl font-black text-cyan-400 mb-2">
                  {reputation?.total_tasks_completed || 0}
                </div>
                <div className="text-sm text-cyan-100/60 font-semibold">Tasks</div>
              </div>

              <div className="p-8 bg-[#0a1411] border-2 border-cyan-400/40 rounded-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-cyan-400 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#050a08]" />
                  </div>
                  <span className="text-sm font-black text-cyan-400 tracking-wider">EARNED</span>
                </div>
                <div className="text-5xl font-black text-cyan-400 mb-2">
                  {reputation?.total_rewards_earned?.toFixed(0) || 0}
                </div>
                <div className="text-sm text-cyan-100/60 font-semibold">RITUAL</div>
              </div>
            </div>

            {/* Active Tasks */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-cyan-400">ACTIVE TASKS</h2>
                <button
                  onClick={() => router.push("/tasks")}
                  className="px-4 py-2 border border-cyan-400/50 text-cyan-400 rounded-lg font-bold text-sm hover:bg-cyan-400/10 transition"
                >
                  BROWSE TASKS
                </button>
              </div>

              {activeTasks.length === 0 ? (
                <div className="p-12 bg-[#0a1411] border-2 border-cyan-400/40 rounded-2xl text-center">
                  <Briefcase className="w-16 h-16 text-cyan-400/40 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-cyan-400 mb-2">NO ACTIVE TASKS</h3>
                  <p className="text-cyan-100/60 mb-6">Start mining by joining available tasks</p>
                  <button
                    onClick={() => router.push("/tasks")}
                    className="px-6 py-3 bg-cyan-400 text-[#050a08] rounded-lg font-black hover:bg-cyan-300 transition"
                  >
                    BROWSE TASKS
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTasks.map((task) => (
                    <div key={task.id} className="p-6 bg-[#0a1411] border-2 border-cyan-400/40 rounded-2xl hover:border-cyan-400/60 transition">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-cyan-400 rounded-xl flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-[#050a08]" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-cyan-400">{task.title}</h3>
                            <p className="text-sm text-cyan-100/60 font-semibold">Reward: {task.reward}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-black rounded-full border border-green-500/40">
                          IN PROGRESS
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-cyan-100/60 font-semibold">Progress</span>
                          <span className="text-cyan-400 font-black">{task.progress}/{task.total} submissions</span>
                        </div>
                        <div className="w-full bg-[#050a08] rounded-full h-2">
                          <div
                            className="bg-cyan-400 h-2 rounded-full transition-all"
                            style={{ width: `${(task.progress / task.total) * 100}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-cyan-400/80 text-sm font-bold">
                            <Clock className="w-4 h-4" />
                            <span>{task.deadline} remaining</span>
                          </div>
                          <button className="px-4 py-2 bg-cyan-400 text-[#050a08] rounded-lg font-black text-sm hover:bg-cyan-300 transition">
                            CONTINUE
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reputation Progress */}
            <div className="mt-8 p-8 bg-[#0a1411] border-2 border-cyan-400/40 rounded-2xl">
              <h3 className="text-xl font-black text-cyan-400 mb-4">REPUTATION PROGRESS</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyan-100/60 font-semibold">Current Level</span>
                  <span className="text-cyan-400 font-black">
                    {reputation?.reputation_score >= 80 ? "ELITE" : reputation?.reputation_score >= 60 ? "EXPERIENCED" : "BEGINNER"}
                  </span>
                </div>
                <div className="w-full bg-[#050a08] rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-green-400 h-3 rounded-full transition-all"
                    style={{ width: `${reputation?.reputation_score || 50}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-cyan-100/40 font-bold">
                  <span>BEGINNER (0)</span>
                  <span>EXPERIENCED (60)</span>
                  <span>ELITE (80)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
