import { NextRequest, NextResponse } from 'next/server'
import { generatePKCE, getDigiLockerAuthUrl, isDigiLockerConfigured } from '@/lib/digilocker'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const state = crypto.randomUUID()
    const { verifier, challenge } = generatePKCE()

    let authUrl = getDigiLockerAuthUrl(state, challenge)

    if (!isDigiLockerConfigured()) {
      // Mock bypass: redirect directly to the local callback
      const callbackUrl = new URL('/api/auth/digilocker/callback', req.nextUrl.origin)
      callbackUrl.searchParams.set('code', 'mock_auth_code_xyz')
      callbackUrl.searchParams.set('state', state)
      authUrl = callbackUrl.toString()
    }

    const response = NextResponse.redirect(authUrl)

    // Store state and verifier in cookies (valid for 10 minutes)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 600 // 10 minutes
    }

    response.cookies.set('dl_oauth_state', state, cookieOptions)
    response.cookies.set('dl_oauth_verifier', verifier, cookieOptions)

    return response
  } catch (error: any) {
    console.error('DigiLocker authorization redirect initiation failed:', error)
    return NextResponse.json({ error: 'Failed to initiate DigiLocker redirection' }, { status: 500 })
  }
}
