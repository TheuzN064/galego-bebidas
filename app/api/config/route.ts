import { NextRequest, NextResponse } from 'next/server'
import { getConfig, updateConfig } from '@/lib/db'
import { Config } from '@/types'
import { verifyAdminSession } from '@/lib/auth'

export async function GET() {
  try {
    const config = await getConfig()
    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(request)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config: Config = await request.json()
    await updateConfig(config)
    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
  }
}
