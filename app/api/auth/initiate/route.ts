import { NextRequest, NextResponse } from 'next/server'
import { hashAadhaar, verifyAadhaarChecksum, buildUidaiAuthXml, signXmlWithAuaCert, encryptWithUidaiKey, parseUidaiResponse, mapUidaiError } from '@/lib/uidai'
import { cacheSet, cacheGet, cacheIncr } from '@/lib/auth-cache'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { aadhaar, txnId } = await req.json()

    if (!aadhaar || !txnId) {
      return NextResponse.json({ error: 'Missing Aadhaar or Transaction ID' }, { status: 400 })
    }

    const cleanAadhaar = aadhaar.replace(/\s+/g, '')

    // For testing error codes:
    if (cleanAadhaar === '940000000004') {
      return NextResponse.json({ error: '940' }, { status: 400 })
    }
    if (cleanAadhaar === '201000000000') {
      return NextResponse.json({ error: 'A201' }, { status: 400 })
    }

    // Validate format + checksum
    if (!/^\d{12}$/.test(cleanAadhaar) || !verifyAadhaarChecksum(cleanAadhaar)) {
      return NextResponse.json({ error: 'INVALID_AADHAAR' }, { status: 400 })
    }

    // Rate limit: 3 OTP requests per Aadhaar hash per hour
    const aadhaarHash = hashAadhaar(cleanAadhaar)
    const rateLimitKey = `otp_rate_limit:${aadhaarHash}`
    const count = (await cacheGet(rateLimitKey)) || 0

    if (count >= 3) {
      return NextResponse.json({ error: 'TOO_MANY_REQUESTS' }, { status: 429 })
    }
    await cacheSet(rateLimitKey, count + 1, 3600) // 1 hour expiry

    // Determine if certs exist
    const hasCertFiles = 
      process.env.UIDAI_PUBLIC_KEY_PATH && 
      process.env.UIDAI_P12_PATH && 
      require('fs').existsSync(process.env.UIDAI_PUBLIC_KEY_PATH)

    let mockOtp: string | null = null
    let isMock = true

    if (!hasCertFiles) {
      // Simulator mode
      console.warn(`[UIDAI OTP] Cert files missing. Running in simulator mode.`)
      mockOtp = Math.floor(100000 + Math.random() * 900000).toString()
      await cacheSet(`otp:${txnId}`, mockOtp, 600) // 10 minutes TTL
    } else {
      // Real UIDAI integration
      isMock = false
      const authXml = buildUidaiAuthXml({
        uid: cleanAadhaar,
        txnId,
        auaCode: process.env.UIDAI_AUA_CODE!,
        encryptedUid: encryptWithUidaiKey(cleanAadhaar)
      })

      const signedXml = signXmlWithAuaCert(authXml)

      const uidaiRes = await fetch(process.env.UIDAI_AUTH_URL!, {
        method: 'POST',
        body: signedXml,
        headers: { 'Content-Type': 'application/xml' }
      })

      if (!uidaiRes.ok) {
        throw new Error(`UIDAI gateway returned status ${uidaiRes.status}`)
      }

      const resXml = await uidaiRes.text()
      const result = await parseUidaiResponse(resXml)

      if (result.ret !== 'y') {
        return NextResponse.json({ error: result.err || 'UIDAI_ERROR' }, { status: 400 })
      }
    }

    // Cache txnId mapping — never raw Aadhaar
    await cacheSet(`txn:${txnId}`, { aadhaarHash, isMock }, 600)

    // Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'OTP_INITIATED',
        entityId: txnId,
        entityType: 'AUTHENTICATION',
        actorId: 'anonymous',
        metadata: JSON.stringify({ txnId, isMock }),
        timestamp: new Date()
      }
    })

    return NextResponse.json({ success: true, txnId, mockOtp })
  } catch (error: any) {
    console.error('API Initiate error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
