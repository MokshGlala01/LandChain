import { auth } from '@/lib/auth'
import { redirectByRole } from '@/lib/auth-session'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  const role = session.user.role ?? 'CITIZEN'
  const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return NextResponse.redirect(new URL(redirectByRole(role), nextAuthUrl))
}
