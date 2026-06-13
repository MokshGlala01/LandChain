import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendOtp } from '@/lib/sms'
import { hashMobile } from '@/lib/auth-session'
import { cacheGet, cacheSet } from '@/lib/auth-cache'

async function rateLimit(key: string, limit: { max: number }) {
  const count = (await cacheGet(key)) || 0
  if (count >= limit.max) {
    throw new Error('TOO_MANY_REQUESTS')
  }
  await cacheSet(key, count + 1, 3600)
}

export async function POST(req: NextRequest) {
  try {
    const { mobile } = await req.json()

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { error: 'INVALID_MOBILE', message: 'Enter a valid 10-digit mobile number' },
        { status: 400 }
      )
    }

    const mobileHash = hashMobile(mobile)
    
    // Check if user already exists
    const user = await prisma.user.findUnique({ where: { mobileHash } })
    if (user) {
      return NextResponse.json(
        { error: 'ACCOUNT_EXISTS', message: 'An account already exists with this number. Please login.' },
        { status: 409 }
      )
    }

    try {
      await rateLimit(`sms_limit:${mobileHash}`, { max: 5 })
    } catch {
      return NextResponse.json(
        { error: 'TOO_MANY_REQUESTS', message: 'OTP limit exceeded. Try again in an hour.' },
        { status: 429 }
      )
    }

    const result = await sendOtp(mobile)
    if (!result.success) {
      return NextResponse.json(
        { error: 'OTP_SEND_FAILED', message: 'Could not dispatch OTP SMS. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      ...(process.env.NODE_ENV !== 'production' && {
        isMock: result.isMock,
        debug: { otp: result.otp }
      })
    })
  } catch (error: any) {
    console.error('Register send-otp error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
