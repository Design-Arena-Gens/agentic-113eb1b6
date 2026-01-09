import { NextResponse } from 'next/server'
import { Orchestrator } from '@/lib/orchestrator'
import { storage } from '@/lib/storage'

// This endpoint can be called by Vercel Cron or external cron services
export async function GET(request: Request) {
  try {
    // Verify authorization header (optional security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const state = storage.getState()

    if (state.isRunning) {
      return NextResponse.json(
        { error: 'A job is already running' },
        { status: 409 }
      )
    }

    // Run job asynchronously
    const orchestrator = new Orchestrator()
    orchestrator.run().catch(error => {
      console.error('Cron job failed:', error)
    })

    return NextResponse.json({
      message: 'Cron job triggered successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to trigger cron job' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
