import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { getConfig } from './db'
import { 
  SESSION_COOKIE_NAME, 
  SESSION_MAX_AGE, 
  createSessionCookie, 
  verifyAdminSession 
} from './session'

export { 
  SESSION_COOKIE_NAME, 
  SESSION_MAX_AGE, 
  createSessionCookie, 
  verifyAdminSession 
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
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
