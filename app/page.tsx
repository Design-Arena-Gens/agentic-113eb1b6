'use client'

import { useState, useEffect } from 'react'

interface LogEntry {
  timestamp: string
  level: string
  message: string
  agent?: string
}

interface SystemStatus {
  isRunning: boolean
  lastRun?: string
  nextRun?: string
  totalVideos: number
  logs: LogEntry[]
}

export default function Home() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [manualRunning, setManualRunning] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status')
      const data = await res.json()
      setStatus(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch status:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleManualRun = async () => {
    setManualRunning(true)
    try {
      const res = await fetch('/api/trigger', { method: 'POST' })
      const data = await res.json()
      alert(data.message || 'Job triggered successfully')
      await fetchStatus()
    } catch (error) {
      alert('Failed to trigger job')
    }
    setManualRunning(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-white text-center">Loading...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-2">
            Autonomous YouTube System
          </h1>
          <p className="text-gray-300 mb-8">
            Fully automated video creation and publishing
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg">
              <div className="text-blue-100 text-sm font-semibold mb-2">
                Status
              </div>
              <div className="text-white text-2xl font-bold">
                {status?.isRunning ? '🟢 Running' : '⚪ Idle'}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg">
              <div className="text-green-100 text-sm font-semibold mb-2">
                Total Videos
              </div>
              <div className="text-white text-2xl font-bold">
                {status?.totalVideos || 0}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg">
              <div className="text-purple-100 text-sm font-semibold mb-2">
                Next Run
              </div>
              <div className="text-white text-lg font-bold">
                {status?.nextRun || 'Not scheduled'}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <button
              onClick={handleManualRun}
              disabled={manualRunning || status?.isRunning}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {manualRunning ? '⏳ Running...' : '▶️ Trigger Manual Run'}
            </button>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">
              System Logs
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {status?.logs && status.logs.length > 0 ? (
                status.logs.slice(-20).reverse().map((log, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg text-sm font-mono ${
                      log.level === 'error'
                        ? 'bg-red-500/20 text-red-200'
                        : log.level === 'success'
                        ? 'bg-green-500/20 text-green-200'
                        : 'bg-blue-500/20 text-blue-200'
                    }`}
                  >
                    <span className="text-gray-400">{log.timestamp}</span>
                    {log.agent && (
                      <span className="ml-2 text-yellow-300">
                        [{log.agent}]
                      </span>
                    )}
                    <span className="ml-2">{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-8">
                  No logs yet
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-slate-800/30 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">
              System Agents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-lg font-semibold text-blue-300 mb-2">
                  📥 Downloader Agent
                </div>
                <div className="text-sm text-gray-300">
                  Finds and downloads copyright-free videos and music
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-lg font-semibold text-green-300 mb-2">
                  🎬 Video Creation Agent
                </div>
                <div className="text-sm text-gray-300">
                  Generates scripts, voiceovers, and combines media
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-lg font-semibold text-purple-300 mb-2">
                  📤 YouTube Publisher Agent
                </div>
                <div className="text-sm text-gray-300">
                  Creates thumbnails and uploads to YouTube
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
