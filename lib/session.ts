import { NextRequest } from 'next/server'

export const SESSION_COOKIE_NAME = 'admin_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

const SECRET_KEY = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'galego-deposito-secret-key-2025'

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function createSessionCookie(): Promise<string> {
  const timestamp = Date.now()
  const randomId = crypto.randomUUID()
  const payload = `${timestamp}.${randomId}`
  
  const key = await getHmacKey()
  const enc = new TextEncoder()
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  const signature = bufferToHex(sigBuffer)
  
  return `${payload}.${signature}`
}

export async function verifyAdminSession(request: NextRequest): Promise<boolean> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)
  
  if (!sessionCookie || !sessionCookie.value) {
    return false
  }

  const token = sessionCookie.value
  const parts = token.split('.')
  if (parts.length !== 3) {
    return false
  }

  const [timestampStr, randomId, signature] = parts
  const timestamp = parseInt(timestampStr, 10)
  
  if (isNaN(timestamp)) return false
  
  // Check expiration (7 days)
  if (Date.now() - timestamp > SESSION_MAX_AGE * 1000) {
    return false
  }

  // Verify HMAC signature
  try {
    const payload = `${timestampStr}.${randomId}`
    const key = await getHmacKey()
    const enc = new TextEncoder()
    const expectedSigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
    const expectedSignature = bufferToHex(expectedSigBuffer)
    
    return signature === expectedSignature
  } catch {
    return false
  }
}
