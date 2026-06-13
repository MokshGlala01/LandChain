import { NextRequest, NextResponse } from 'next/server'
import { cacheGet, cacheSet, cacheDel, cacheIncr } from '@/lib/auth-cache'
import { prisma } from '@/lib/db'
import { buildUidaiOtpVerifyXml, signXmlWithAuaCert, encryptWithUidaiKey, parseUidaiResponse, generateSessionKey } from '@/lib/uidai'

export async function POST(req: NextRequest) {
  try {
    const { txnId, otp, aadhaarHash } = await req.json()

    if (!txnId || !otp || !aadhaarHash) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const txnData = await cacheGet(`txn:${txnId}`)
    if (!txnData) {
      return NextResponse.json({ error: 'SESSION_EXPIRED' }, { status: 400 })
    }

    if (txnData.aadhaarHash !== aadhaarHash) {
      return NextResponse.json({ error: 'HASH_MISMATCH' }, { status: 400 })
    }

    const failKey = `fails:${txnId}`
    const currentFails = (await cacheGet(failKey)) || 0

    if (currentFails >= 3) {
      await cacheDel(`txn:${txnId}`)
      await cacheDel(failKey)
      await cacheDel(`otp:${txnId}`)
      return NextResponse.json({ error: 'Too many verification attempts. Please restart.' }, { status: 400 })
    }

    let success = false
    let authCode = `MOCK_AUTH_CODE_${txnId}`

    if (txnData.isMock) {
      const expectedOtp = await cacheGet(`otp:${txnId}`)
      if (expectedOtp === otp) {
        success = true
      }
    } else {
      const { rawKey, encryptedKey } = generateSessionKey()
      const verifyXml = buildUidaiOtpVerifyXml({
        txnId,
        encryptedOtp: encryptWithUidaiKey(otp),
        auaCode: process.env.UIDAI_AUA_CODE!,
        sessionKey: encryptedKey
      })

      const result = await fetch(process.env.UIDAI_AUTH_URL!, {
        method: 'POST',
        body: signXmlWithAuaCert(verifyXml),
        headers: { 'Content-Type': 'application/xml' }
      })

      if (!result.ok) {
        throw new Error(`UIDAI gateway returned status ${result.status}`)
      }

      const resXml = await result.text()
      const parsed = await parseUidaiResponse(resXml)
      if (parsed.ret === 'y') {
        success = true
        authCode = parsed.code || authCode
      }
    }

    if (!success) {
      const newFails = await cacheIncr(failKey)
      const attemptsLeft = 3 - newFails
      if (attemptsLeft <= 0) {
        await cacheDel(`txn:${txnId}`)
        await cacheDel(failKey)
        await cacheDel(`otp:${txnId}`)
      }
      return NextResponse.json({ error: 'OTP_INCORRECT', attemptsLeft }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { aadhaarHash } })

    // Clear verification cache
    await cacheDel(failKey)
    await cacheDel(`otp:${txnId}`)

    if (existingUser) {
      await cacheDel(`txn:${txnId}`)
      await prisma.auditLog.create({
        data: { action: 'LOGIN_SUCCESS', actorId: existingUser.id, metadata: JSON.stringify({ txnId }) }
      })
      return NextResponse.json({ success: true, isNewUser: false, userId: existingUser.id })
    }

    // New user — cache authCode to be retrieved by eKYC route
    await cacheSet(`auth:${txnId}`, { authCode, aadhaarHash, isMock: txnData.isMock }, 300)

    return NextResponse.json({ success: true, isNewUser: true, authCode })
  } catch (error: any) {
    console.error('API Verify error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
