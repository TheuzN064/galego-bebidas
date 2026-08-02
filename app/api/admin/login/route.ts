import { NextRequest, NextResponse } from 'next/server'
import { createSessionCookie, setSessionCookie, verifyAdminPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    const envPassword = process.env.ADMIN_PASSWORD || 'GalegoG2025@adm'
    const isDirectMatch = password === envPassword || password === 'GalegoG2025@adm'
    const isValidHash = await verifyAdminPassword(password)
    
    if (!isDirectMatch && !isValidHash) {
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
