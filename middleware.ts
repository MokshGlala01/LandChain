import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJwt, SESSION_COOKIE_NAME } from './lib/auth-session'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Check if the route is a dashboard route
  const isDashboardRoute = /^\/(citizen|registrar|bank|admin|builder|agri)/.test(pathname)
  if (!isDashboardRoute) {
    return NextResponse.next()
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value

  // 1. Redirect unauthenticated users
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 2. Validate token
  const payload = await verifyJwt(token)
  if (!payload || !payload.role) {
    const response = NextResponse.redirect(new URL('/login', req.url))
    response.cookies.delete(SESSION_COOKIE_NAME)
    return response
  }

  // 3. Role-based routing validation
  const roleRoutes: Record<string, string[]> = {
    CITIZEN:    ['/citizen'],
    REGISTRAR:  ['/registrar'],
    BANK:       ['/bank'],
    ADMIN:      ['/admin'],
    BUILDER:    ['/builder'],
    AGRI:       ['/agri']
  }

  const allowedPaths = roleRoutes[payload.role] || []
  const isAuthorized = allowedPaths.some((p) => pathname.startsWith(p))

  if (!isAuthorized) {
    // Redirect unauthorized dashboard access back to base dashboard or landing page
    const fallbackRoute = allowedPaths[0] || '/'
    return NextResponse.redirect(new URL(fallbackRoute, req.url))
  }

  return NextResponse.next()
}

// Optimization matcher configuration
export const config = {
  matcher: [
    '/citizen/:path*',
    '/registrar/:path*',
    '/bank/:path*',
    '/admin/:path*',
    '/builder/:path*',
    '/agri/:path*'
  ]
}
