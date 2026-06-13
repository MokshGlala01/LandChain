import { NextRequest, NextResponse } from 'next/server'
import { checkOtp } from '@/lib/sms'

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

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Register verify-otp error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
