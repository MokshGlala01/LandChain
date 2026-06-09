import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, fetchDigiLockerProfile, fetchDigiLockerAadhaar, parseDigiLockerKycXml } from '@/lib/digilocker'

export const dynamic = 'force-dynamic'
import { hashAadhaar, encryptKycData } from '@/lib/aadhaar-crypto'
import { prisma } from '@/lib/db'
import { signJwt, SESSION_COOKIE_NAME } from '@/lib/auth-session'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    const cookieState = req.cookies.get('dl_oauth_state')?.value
    const verifier = req.cookies.get('dl_oauth_verifier')?.value

    // 1. CSRF Verification
    if (!state || !cookieState || state !== cookieState) {
      return NextResponse.json({ error: 'CSRF token mismatch. Security check failed.' }, { status: 400 })
    }

    if (!code || !verifier) {
      return NextResponse.json({ error: 'Missing authorization code or verifier' }, { status: 400 })
    }

    // 2. Token Exchange
    const accessToken = await exchangeCodeForToken(code, verifier)
    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to exchange authorization code for access token' }, { status: 400 })
    }

    // 3. Retrieve user profile
    const profile = await fetchDigiLockerProfile(accessToken)
    if (!profile) {
      return NextResponse.json({ error: 'Failed to retrieve user profile from DigiLocker' }, { status: 400 })
    }

    // 4. Fetch eAadhaar XML
    const xmlStr = await fetchDigiLockerAadhaar(accessToken)
    let parsedKyc = null
    if (xmlStr) {
      parsedKyc = await parseDigiLockerKycXml(xmlStr)
    }

    // Format DOB: convert DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD
    let dobFormatted = '1985-08-15'
    const rawDob = parsedKyc?.dob || profile.dob
    if (rawDob) {
      if (rawDob.includes('/')) {
        dobFormatted = rawDob.split('/').reverse().join('-')
      } else if (rawDob.includes('-')) {
        const parts = rawDob.split('-')
        if (parts[0].length === 4) {
          dobFormatted = rawDob // Already YYYY-MM-DD
        } else {
          dobFormatted = parts.reverse().join('-')
        }
      }
    }

    // Hash the DigiLocker unique subscriber ID for database storage
    const aadhaarHash = hashAadhaar(profile.sub)

    // 5. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { aadhaarHash }
    })

    if (existingUser) {
      // Issue session and auto-login returning users
      const token = await signJwt({
        userId: existingUser.id,
        role: existingUser.role,
        name: existingUser.name
      }, '7d')

      const dashboardRoute = `/${existingUser.role.toLowerCase()}`
      const response = NextResponse.redirect(new URL(dashboardRoute, req.nextUrl.origin))
      
      response.headers.set(
        'Set-Cookie',
        `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
      )

      // Clear OAuth cookies
      response.cookies.delete('dl_oauth_state')
      response.cookies.delete('dl_oauth_verifier')

      // Log login audit
      await prisma.auditLog.create({
        data: {
          action: 'USER_LOGGED_IN',
          entityId: existingUser.id,
          entityType: 'USER',
          actorId: existingUser.id,
          metadata: JSON.stringify({ method: 'DIGILOCKER' }),
          timestamp: new Date()
        }
      })

      return response
    }

    // 6. User does not exist -> Encrypt demographic details and redirect to register completion page
    const kycData = {
      name: parsedKyc?.name || profile.name,
      dob: dobFormatted,
      gender: parsedKyc?.gender || (profile.gender === 'M' || profile.gender === 'Male' ? 'Male' : 'Female'),
      address: parsedKyc?.address || 'Verified via DigiLocker',
      photo: parsedKyc?.photo || '',
      aadhaarHash
    }

    const encryptedToken = encryptKycData(kycData)
    const registerUrl = new URL('/register/digilocker', req.nextUrl.origin)
    registerUrl.searchParams.set('data', encryptedToken)

    const response = NextResponse.redirect(registerUrl)
    
    // Clear cookies
    response.cookies.delete('dl_oauth_state')
    response.cookies.delete('dl_oauth_verifier')

    return response
  } catch (error: any) {
    console.error('DigiLocker callback failed:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
