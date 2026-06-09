import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/auth-session'

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true })
  
  // Clear the cookie by setting Max-Age to 0 and Expires to a past date
  response.headers.set(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  )

  return response
}
export async function GET(req: NextRequest) {
  // Support both GET and POST for logout redirects if needed
  const response = NextResponse.redirect(new URL('/login', req.nextUrl.origin))
  response.headers.set(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  )
  return response
}
