import { NextRequest, NextResponse } from 'next/server'
import { hashAadhaar } from '@/lib/aadhaar-crypto'
import { verifyAadhaarChecksum, buildUidaiAuthXml, signXmlWithAuaCert, encryptWithUidaiKey, parseUidaiResponse } from '@/lib/uidai'
import { cacheSet, cacheIncr } from '@/lib/auth-cache'
import { prisma } from '@/lib/db'

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return '127.0.0.1'
}

export async function POST(req: NextRequest) {
  try {
    const { aadhaar, txnId } = await req.json()
    
    if (!aadhaar || !txnId) {
      return NextResponse.json({ error: 'Missing Aadhaar number or transaction ID' }, { status: 400 })
    }

    const cleanAadhaar = aadhaar.replace(/\s+/g, '')

    // Checksum verification
    if (!verifyAadhaarChecksum(cleanAadhaar)) {
      return NextResponse.json({ error: 'Invalid Aadhaar number format or checksum' }, { status: 400 })
    }

    const aadhaarHash = hashAadhaar(cleanAadhaar)
    const ip = getIp(req)

    // Rate Limiting (max 3 per IP per hour)
    const rateLimitKey = `rate_limit:initiate:${ip}`
    const count = await cacheIncr(rateLimitKey)
    if (count > 3) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please try again after an hour.' },
        { status: 429 }
      )
    }

    // Determine if certs exist
    const hasCertFiles = 
      process.env.UIDAI_PUBLIC_KEY_PATH && 
      process.env.UIDAI_P12_PATH && 
      require('fs').existsSync(process.env.UIDAI_PUBLIC_KEY_PATH)

    let mockOtp: string | null = null

    if (!hasCertFiles) {
      // Certificate files are missing -> Sandbox Mock Mode
      console.warn(`[UIDAI OTP] Cert files missing. Running in simulator mode.`)
      
      // Generate deterministic or random 6-digit OTP
      mockOtp = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Store in cache for verification
      await cacheSet(`aadhaar_otp:${txnId}`, mockOtp, 120)
      await cacheSet(`aadhaar_txn:${txnId}`, { aadhaarHash, isMock: true }, 120)
      
      console.log(`[UIDAI OTP SIMULATION] Txn ID: ${txnId} | Hash: ${aadhaarHash} | Mock OTP: ${mockOtp}`)
    } else {
      // Real AUA integration
      const encryptedUid = encryptWithUidaiKey(cleanAadhaar)
      const authXml = buildUidaiAuthXml({
        uid: cleanAadhaar,
        txnId,
        auaCode: process.env.UIDAI_AUA_CODE || 'aua',
        encryptedUid
      })

      const signedXml = signXmlWithAuaCert(authXml)

      // Post to UIDAI endpoint
      const response = await fetch(process.env.UIDAI_AUTH_URL || 'https://auth.uidai.gov.in/1.6/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml'
        },
        body: signedXml
      })

      if (!response.ok) {
        throw new Error(`UIDAI Gateway returned HTTP status ${response.status}`)
      }

      const resXml = await response.text()
      const result = await parseUidaiResponse(resXml)

      if (result.ret !== 'y') {
        return NextResponse.json(
          { error: `UIDAI Error: ${result.err || 'Failed to dispatch OTP'}` },
          { status: 400 }
        )
      }

      // Store session state in cache (no raw Aadhaar)
      await cacheSet(`aadhaar_txn:${txnId}`, { aadhaarHash, isMock: false }, 120)
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'OTP_INITIATED',
        entityId: txnId,
        entityType: 'AUTHENTICATION',
        actorId: 'anonymous',
        metadata: JSON.stringify({ txnId, isMock: !hasCertFiles }),
        timestamp: new Date()
      }
    })

    return NextResponse.json({ success: true, txnId, mockOtp, aadhaarHash })
  } catch (error: any) {
    console.error('UIDAI OTP Initiate failed:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
