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

  // Temporarily disable API protection for development without Redis
  // Protect write API routes
  if (pathname.startsWith('/api') && 
      (pathname.includes('/products') && 
       (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') ||
       pathname.includes('/categories') && 
       (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') ||
       pathname.includes('/coupons') && 
       (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') ||
       pathname.includes('/config') && 
       request.method === 'PUT')) {
    
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
