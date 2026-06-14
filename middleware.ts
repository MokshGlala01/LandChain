import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const session = req.auth
  const { pathname } = req.nextUrl

  const authPages = ['/login', '/register']
  const protectedPrefixes = ['/citizen', '/registrar', '/bank', '/admin', '/builder', '/agri']
  const isProtected = protectedPrefixes.some(p => pathname.startsWith(p))
  const isAuthPage = authPages.some(p => pathname.startsWith(p))

  // Redirect unauthenticated users away from protected pages
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Redirect authenticated users away from login/register
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/auth/redirect', req.url))
  }

  // Role-based access guard
  if (isProtected && session) {
    const roleRoutes: Record<string, string> = {
      CITIZEN: '/citizen', REGISTRAR: '/registrar', BANK: '/bank',
      ADMIN: '/admin', BUILDER: '/builder', AGRI: '/agri'
    }
    const allowed = roleRoutes[session.user?.role ?? 'CITIZEN']
    if (!pathname.startsWith(allowed)) {
      return NextResponse.redirect(new URL(allowed, req.url))
    }
  }
})

export const config = {
  matcher: [
    '/citizen/:path*', '/registrar/:path*', '/bank/:path*',
    '/admin/:path*', '/builder/:path*', '/agri/:path*',
    '/login', '/register'
  ]
}
