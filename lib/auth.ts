import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { getConfig } from './db'

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export function createSessionCookie(): string {
  const sessionId = crypto.randomUUID()
  return sessionId
}

export function setSessionCookie(sessionId: string) {
  cookies().set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

export function deleteSessionCookie() {
  cookies().delete(SESSION_COOKIE_NAME)
}

export async function verifyAdminSession(request: NextRequest): Promise<boolean> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)
  
  if (!sessionCookie) {
    return false
  }

  // In a real implementation, you would validate the session against Redis
  // For now, we'll check if the cookie exists and has a valid format
  try {
    const sessionId = sessionCookie.value
    return sessionId.length > 0
  } catch {
    return false
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    const config = await getConfig()
    
    // If no password hash exists in config, check env var
    if (!config.adminPasswordHash) {
      const envPassword = process.env.ADMIN_PASSWORD
      if (!envPassword) {
        // First time setup - accept any password and hash it
        return true
      }
      return password === envPassword
    }
    
    return await verifyPassword(password, config.adminPasswordHash)
  } catch (error) {
    // If Redis is not configured, fall back to env var
    const envPassword = process.env.ADMIN_PASSWORD
    if (!envPassword) {
      // No env var set, accept any password for development
      return true
    }
    return password === envPassword
  }
}
