"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, Award, TrendingUp, Briefcase, Clock, CheckCircle } from "lucide-react"
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { DynamicWidget } from '@dynamic-labs/sdk-react-core'

export default function EvaluatorsPage() {
  const router = useRouter();
  const { primaryWallet, user } = useDynamicContext();
  const walletAddress = primaryWallet?.address;
  const [reputation, setReputation] = useState<any>(null);
  const [activeTasks, setActiveTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (wallet: string) => {
    try {
      setLoading(true);
      
      // Fetch reputation
      const repResponse = await fetch(`http://localhost:8000/users/${wallet}/reputation`);
      if (repResponse.ok) {
        const repData = await repResponse.json();
        setReputation(repData);
      } else {
        // Mock reputation data if API call fails
        setReputation({
          score: 85,
          level: 'Expert',
          tasksCompleted: 24,
          accuracy: '92%'
        });
      }

      // Fetch active tasks
      const tasksResponse = await fetch(`http://localhost:8000/users/${wallet}/submissions`);
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setActiveTasks(tasksData);
      } else {
        // Mock tasks data if API call fails
        setActiveTasks([
          {
            id: 1,
            title: 'Task 1',
            description: 'Complete the evaluation for project X',
            progress: 2,
            total: 5,
            deadline: '2 days',
            status: 'in_progress',
            reward: '2,500 CHAT'
          },
          {
            id: 2,
            title: 'Review code submissions',
            description: 'Review code submissions for project Y',
            status: 'pending',
            reward: '3,000 CHAT',
            progress: 0,
            total: 5,
            deadline: '3 days'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Set mock data in case of error
      setReputation({
        score: 85,
        level: 'Expert',
      });
      setActiveTasks([
        {
          id: 1,
          title: 'Review code submissions',
          description: 'Review code submissions for project X',
          status: 'in-progress',
          reward: '2,500 CHAT',
          progress: 2,
          total: 5,
          deadline: '2 days'
        },
        {
          id: 2,
          title: 'Review code submissions',
          description: 'Review code submissions for project Y',
          status: 'pending',
          reward: '3,000 CHAT',
          progress: 0,
          total: 5,
          deadline: '3 days'
        }
      ]);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (walletAddress) {
      fetchUserData(walletAddress);
    } else {
      // Handle case when wallet is not connected
      setLoading(false);
      setReputation(null);
      setActiveTasks([]);
    }
  }, [walletAddress])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050a08] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050a08] text-white">
      {/* Header */}
      <nav className="relative z-50 px-4 md:px-8 py-4 md:py-6 flex items-center justify-between border-b border-cyan-900/30">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-400 rounded-2xl flex items-center justify-center">
              <span className="text-2xl md:text-3xl font-black text-[#050a08]">Θ</span>
            </div>
            <div>
              <div className="text-lg md:text-2xl font-black tracking-wider text-cyan-400" style={{ fontFamily: "Arial Black, sans-serif" }}>
                THESIS LAB
              </div>
            </div>
          </div>
          <div className="text-[10px] md:text-xs text-cyan-400/70 font-bold tracking-wide">PROOF OF INFERENCE MINING</div>
        </div>

        <div className="flex items-center space-x-4">
          <DynamicWidget />
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
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
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Evaluator Dashboard</h1>
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
                  {(() => {
                    if (reputation?.reputation_score >= 80) return "ELITE";
                    if (reputation?.reputation_score >= 60) return "EXPERIENCED";
                    return "BEGINNER";
                  })()}
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
      </div>
    </div>
  )
}
