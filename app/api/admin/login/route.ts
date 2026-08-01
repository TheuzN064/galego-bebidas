import { NextRequest, NextResponse } from 'next/server'
import { createSessionCookie, setSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    // Simple password check for development without Redis
    const envPassword = process.env.ADMIN_PASSWORD || 'galego123'
    
    if (password !== envPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const sessionId = createSessionCookie()
    setSessionCookie(sessionId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
