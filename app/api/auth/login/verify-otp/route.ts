import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkOtp } from '@/lib/sms'
import { hashMobile, signJwt, SESSION_COOKIE_NAME } from '@/lib/auth-session'

export async function POST(req: NextRequest) {
  try {
    const { mobile, otp } = await req.json()

    if (!mobile || !otp) {
      return NextResponse.json({ error: 'MISSING_PARAMETERS', message: 'Mobile and OTP are required' }, { status: 400 })
    }

    const result = await checkOtp(mobile, otp)
    if (!result.success) {
      return NextResponse.json({ error: 'OTP_INCORRECT', message: 'Incorrect or expired OTP' }, { status: 400 })
    }

    const mobileHash = hashMobile(mobile)
    const user = await prisma.user.findUnique({ where: { mobileHash } })
    if (!user) {
      return NextResponse.json({ error: 'ACCOUNT_NOT_FOUND', message: 'Account not found' }, { status: 404 })
    }

    if (user.status === 'PENDING_APPROVAL') {
      return NextResponse.json({ success: true, pendingApproval: true })
    }

    // Set JWT Session cookie
    const token = await signJwt({
      userId: user.id,
      role: user.role,
      name: user.name
    }, '7d')

    const response = NextResponse.json({
      success: true,
      role: user.role,
      name: user.name,
      kycStatus: user.kycStatus,
      aadhaarHash: user.aadhaarHash
    })

    response.headers.set(
      'Set-Cookie',
      `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
    )

    await prisma.auditLog.create({
      data: {
        action: 'LOGIN_SUCCESS',
        actorId: user.id,
        metadata: JSON.stringify({ method: 'SMS_OTP' })
      }
    })

    return response
  } catch (error: any) {
    console.error('Login verify-otp error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
