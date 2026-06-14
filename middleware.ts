import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const session = req.auth
  const { pathname } = req.nextUrl

  const protectedPrefixes = ['/citizen', '/registrar', '/bank', '/admin', '/builder', '/agri']
  const isProtected = protectedPrefixes.some(p => pathname.startsWith(p))

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session?.user) {
    const roleRoutes: Record<string, string> = {
      CITIZEN: '/citizen', 
      REGISTRAR: '/registrar', 
      BANK: '/bank',
      ADMIN: '/admin', 
      BUILDER: '/builder', 
      AGRI: '/agri'
    }
    const allowed = roleRoutes[session.user.role ?? 'CITIZEN']
    if (isProtected && !pathname.startsWith(allowed)) {
      return NextResponse.redirect(new URL(allowed, req.url))
    }
  }
})

export const config = {
  matcher: ['/citizen/:path*', '/registrar/:path*', '/bank/:path*', '/admin/:path*', '/builder/:path*', '/agri/:path*']
}
