"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Award, TrendingUp, ArrowLeft } from "lucide-react"
import { getUserReputation, type User } from "@/lib/api"

export default function EvaluatorsPage() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckReputation(e: React.FormEvent) {
    e.preventDefault()
    if (!walletAddress) return

    setLoading(true)
    setError(null)

    try {
      const userData = await getUserReputation(walletAddress)
      setUser(userData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reputation")
      setUser(null)
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
            <Award className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 mr-2 md:mr-3" />
            <h2 className="text-xs md:text-sm font-black text-cyan-400 tracking-widest">FOR EVALUATORS</h2>
          </div>
          <h1
            className="text-4xl md:text-6xl font-black text-cyan-400 mb-3 md:mb-4 tracking-tight"
            style={{ fontFamily: "Arial Black, sans-serif" }}
          >
            YOUR REPUTATION
          </h1>
          <p className="text-base md:text-lg text-cyan-100/60 font-semibold px-4">
            Mine AI inference. Earn token rewards. Build reputation.
          </p>
        </div>

        {/* Reputation Checker */}
        <div className="bg-[#0a1411] border-2 border-cyan-400/40 rounded-2xl p-4 md:p-8 mb-6 md:mb-8">
          <form onSubmit={handleCheckReputation} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-cyan-400 tracking-widest mb-2">WALLET ADDRESS</label>
              <input
                type="text"
                required
                minLength={40}
                maxLength={42}
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full px-4 py-3 bg-[#050a08] border-2 border-cyan-400/30 rounded-lg text-cyan-50 font-mono focus:border-cyan-400 focus:outline-none"
                placeholder="0x..."
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border-2 border-red-500/40 rounded-lg p-4">
                <p className="text-red-400 font-bold text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-cyan-400 text-[#050a08] rounded-lg font-black text-lg tracking-wide hover:bg-cyan-300 transition disabled:opacity-50"
            >
              {loading ? "CHECKING..." : "CHECK REPUTATION"}
            </button>
          </form>
        </div>

        {/* Reputation Display */}
        {user && (
          <div className="bg-[#0a1411] border-2 border-cyan-400/40 rounded-2xl p-4 md:p-8 space-y-6 md:space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Award className="w-10 h-10 md:w-12 md:h-12 text-[#050a08]" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-cyan-400 mb-2">{user.username}</h2>
              <p className="text-cyan-100/60 font-mono text-xs md:text-sm break-all px-4">{user.wallet_address}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-[#050a08] border-2 border-cyan-400/30 rounded-xl p-6 text-center">
                <div className="text-sm font-black text-cyan-400 tracking-widest mb-2">REPUTATION</div>
                <div className="text-5xl font-black text-cyan-400">{user.reputation_score}</div>
                <div className="text-xs text-cyan-100/60 font-bold mt-2">OUT OF 100</div>
              </div>

              <div className="bg-[#050a08] border-2 border-cyan-400/30 rounded-xl p-6 text-center">
                <div className="text-sm font-black text-cyan-400 tracking-widest mb-2">TASKS COMPLETED</div>
                <div className="text-5xl font-black text-cyan-400">{user.total_tasks_completed}</div>
              </div>

              <div className="bg-[#050a08] border-2 border-cyan-400/30 rounded-xl p-6 text-center">
                <div className="text-sm font-black text-cyan-400 tracking-widest mb-2">TOTAL EARNED</div>
                <div className="text-5xl font-black text-cyan-400">{user.total_rewards_earned}</div>
              </div>
            </div>

            <div className="pt-6 border-t-2 border-cyan-400/20 text-center">
              <button
                onClick={() => router.push("/tasks")}
                className="px-8 py-4 bg-cyan-400 text-[#050a08] rounded-lg font-black text-lg tracking-wide hover:bg-cyan-300 transition inline-flex items-center space-x-2"
              >
                <TrendingUp className="w-5 h-5" />
                <span>BROWSE TASKS</span>
              </button>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8 md:mt-12">
          <div className="bg-[#0a1411] border-2 border-cyan-400/30 rounded-2xl p-8">
            <div className="w-12 h-12 bg-cyan-400 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-[#050a08]" />
            </div>
            <h3 className="text-xl font-black text-cyan-400 mb-3 tracking-wide">REAL TOKEN UPSIDE</h3>
            <p className="text-cyan-100/60 font-semibold">
              Earn project tokens instead of stablecoins. When the project grows, so does your reward.
            </p>
          </div>

          <div className="bg-[#0a1411] border-2 border-cyan-400/30 rounded-2xl p-8">
            <div className="w-12 h-12 bg-cyan-400 rounded-xl flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-[#050a08]" />
            </div>
            <h3 className="text-xl font-black text-cyan-400 mb-3 tracking-wide">BUILD REPUTATION</h3>
            <p className="text-cyan-100/60 font-semibold">
              Complete high-quality evaluations to build your on-chain reputation and access better tasks.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
