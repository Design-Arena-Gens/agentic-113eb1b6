import { NextResponse } from 'next/server'
import { storage } from '@/lib/storage'
import { Orchestrator } from '@/lib/orchestrator'

export async function POST() {
  try {
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
      console.error('Manual job failed:', error)
    })

    return NextResponse.json({
      message: 'Job triggered successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to trigger job' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
