import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminSession } from '@/lib/auth'

const SESSION_COOKIE_NAME = 'admin_session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Temporarily disable admin protection for development without Redis
  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)
    
    if (!sessionCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  // Protect write API routes (exclude public endpoints like /api/coupons/validate)
  const isProtectedApiWrite =
    pathname.startsWith('/api') &&
    pathname !== '/api/coupons/validate' &&
    ((pathname.includes('/products') && ['POST', 'PUT', 'DELETE'].includes(request.method)) ||
     (pathname.includes('/categories') && ['POST', 'PUT', 'DELETE'].includes(request.method)) ||
     (pathname.includes('/coupons') && ['POST', 'PUT', 'DELETE'].includes(request.method)) ||
     (pathname.includes('/config') && request.method === 'PUT'))

  if (isProtectedApiWrite) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
