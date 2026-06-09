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

    const txnData = await cacheGet(`aadhaar_txn:${txnId}`)
    if (!txnData) {
      return NextResponse.json({ error: 'Session expired or invalid transaction' }, { status: 400 })
    }

    if (txnData.aadhaarHash !== aadhaarHash) {
      return NextResponse.json({ error: 'Aadhaar hash mismatch' }, { status: 400 })
    }

    const failKey = `aadhaar_fails:${txnId}`
    const currentFails = (await cacheGet(failKey)) || 0

    if (currentFails >= 3) {
      await cacheDel(`aadhaar_txn:${txnId}`)
      await cacheDel(failKey)
      await cacheDel(`aadhaar_otp:${txnId}`)
      return NextResponse.json({ error: 'Too many verification attempts. Session locked.' }, { status: 400 })
    }

    let success = false
    let authCode = ''

    if (txnData.isMock) {
      // Mock validation
      const expectedOtp = await cacheGet(`aadhaar_otp:${txnId}`)
      if (expectedOtp === otp) {
        success = true
        authCode = `MOCK_AUTH_CODE_${txnId}`
      }
    } else {
      // Real UIDAI validation
      const { rawKey, encryptedKey } = generateSessionKey()
      const encryptedOtp = encryptWithUidaiKey(otp)
      
      const verifyXml = buildUidaiOtpVerifyXml({
        txnId,
        encryptedOtp,
        auaCode: process.env.UIDAI_AUA_CODE || 'aua',
        sessionKey: encryptedKey
      })

      const signedXml = signXmlWithAuaCert(verifyXml)

      const response = await fetch(process.env.UIDAI_AUTH_URL || 'https://auth.uidai.gov.in/1.6/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml'
        },
        body: signedXml
      })

      if (!response.ok) {
        throw new Error(`UIDAI returned HTTP status ${response.status}`)
      }

      const resXml = await response.text()
      const result = await parseUidaiResponse(resXml)

      if (result.ret === 'y') {
        success = true
        authCode = result.code || `AUTH_CODE_${txnId}`
      }
    }

    if (!success) {
      const newFails = await cacheIncr(failKey)
      const attemptsLeft = 3 - newFails
      if (attemptsLeft <= 0) {
        await cacheDel(`aadhaar_txn:${txnId}`)
        await cacheDel(failKey)
        await cacheDel(`aadhaar_otp:${txnId}`)
        return NextResponse.json({ error: 'OTP_MISMATCH', attemptsLeft: 0, locked: true }, { status: 400 })
      }
      return NextResponse.json({ error: 'OTP_MISMATCH', attemptsLeft }, { status: 400 })
    }

    // Store auth code temporarily (TTL 5 minutes)
    await cacheSet(`aadhaar_auth:${txnId}`, { authCode, aadhaarHash, isMock: txnData.isMock }, 300)

    // Clear session status
    await cacheDel(failKey)
    await cacheDel(`aadhaar_otp:${txnId}`)

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'OTP_VERIFIED',
        entityId: txnId,
        entityType: 'AUTHENTICATION',
        actorId: 'anonymous',
        metadata: JSON.stringify({ txnId, isMock: txnData.isMock }),
        timestamp: new Date()
      }
    })

    return NextResponse.json({ success: true, authCode })
  } catch (error: any) {
    console.error('UIDAI OTP Verify failed:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
