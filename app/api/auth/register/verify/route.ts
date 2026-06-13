import { NextRequest, NextResponse } from 'next/server'
import { cacheGet, cacheSet, cacheDel, cacheIncr } from '@/lib/auth-cache'
import { fetchUidaiEkyc, verifyUidaiOtp } from '@/lib/uidai'

export async function POST(req: NextRequest) {
  try {
    const { txnId, otp } = await req.json()

    const missing: string[] = []
    if (!txnId) missing.push('txnId')
    if (!otp) missing.push('otp')

    if (missing.length > 0) {
      return NextResponse.json({
        error: 'MISSING_PARAMETERS',
        message: `Missing required field(s): ${missing.join(', ')}`,
        missing
      }, { status: 400 })
    }

    const txnData = await cacheGet(`txn:${txnId}`)
    if (!txnData || txnData.mode !== 'register') {
      return NextResponse.json({ error: 'SESSION_EXPIRED' }, { status: 400 })
    }

    const { aadhaarHash } = txnData

    const failKey = `fails:${txnId}`
    const currentFails = (await cacheGet(failKey)) || 0

    if (currentFails >= 3) {
      await cacheDel(`txn:${txnId}`)
      await cacheDel(failKey)
      await cacheDel(`otp:${txnId}`)
      return NextResponse.json({ error: 'Too many verification attempts. Please restart.' }, { status: 400 })
    }

    const result = await verifyUidaiOtp(txnId, otp)

    if (result.ret !== 'y') {
      const fails = await cacheIncr(failKey)
      const attemptsLeft = 3 - fails
      if (attemptsLeft <= 0) {
        await cacheDel(`txn:${txnId}`)
        await cacheDel(failKey)
        await cacheDel(`otp:${txnId}`)
      }
      return NextResponse.json({ error: 'OTP_INCORRECT', attemptsLeft }, { status: 400 })
    }

    // Fetch full eKYC immediately
    const authCode = result.code || `MOCK_AUTH_CODE_${txnId}`
    const kycData = await fetchUidaiEkyc(txnId, authCode)

    await cacheDel(`txn:${txnId}`)
    await cacheDel(failKey)
    await cacheDel(`otp:${txnId}`)

    return NextResponse.json({ success: true, kyc: kycData, aadhaarHash })
  } catch (error: any) {
    console.error('Register verify error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
