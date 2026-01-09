import { NextResponse } from 'next/server'
import { storage } from '@/lib/storage'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const state = storage.getState()
    const logs = logger.getLogs(50)

    return NextResponse.json({
      ...state,
      logs,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
