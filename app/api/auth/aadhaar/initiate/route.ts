import { NextRequest, NextResponse } from 'next/server'
import { hashAadhaar } from '@/lib/aadhaar-crypto'
import { verifyAadhaarChecksum, buildUidaiAuthXml, signXmlWithAuaCert, encryptWithUidaiKey, parseUidaiResponse } from '@/lib/uidai'
import { cacheSet, cacheIncr } from '@/lib/auth-cache'
import { prisma } from '@/lib/db'
import { sendTwilioSms } from '@/lib/sms'

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return '127.0.0.1'
}

export async function POST(req: NextRequest) {
  try {
    const { aadhaar, txnId, phone: clientPhone } = await req.json()
    
    if (!aadhaar || !txnId) {
      return NextResponse.json({ error: 'Missing Aadhaar number or transaction ID' }, { status: 400 })
    }

    const cleanAadhaar = aadhaar.replace(/\s+/g, '')

    // Checksum verification
    if (!verifyAadhaarChecksum(cleanAadhaar)) {
      return NextResponse.json({ error: 'Invalid Aadhaar number format or checksum' }, { status: 400 })
    }

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

    // 1. Look up user by both old and new hash formats
    const oldHash = 'aadhaar_' + cleanAadhaar
    const newHash = hashAadhaar(cleanAadhaar)

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { aadhaarHash: oldHash },
          { aadhaarHash: newHash }
        ]
      }
    })

    const targetHash = existingUser ? existingUser.aadhaarHash : newHash
    const targetPhone = existingUser?.phone || clientPhone

    // Determine if certs exist
    const hasCertFiles = 
      process.env.UIDAI_PUBLIC_KEY_PATH && 
      process.env.UIDAI_P12_PATH && 
      require('fs').existsSync(process.env.UIDAI_PUBLIC_KEY_PATH)

    let mockOtp: string | null = null
    let sentSms = false

    if (!hasCertFiles) {
      // Sandbox Mock Mode
      console.warn(`[UIDAI OTP] Cert files missing. Running in simulator mode.`)
      
      mockOtp = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Store in cache for verification (valid for 120 seconds / 2 minutes)
      await cacheSet(`aadhaar_otp:${txnId}`, mockOtp, 120)
      await cacheSet(`aadhaar_txn:${txnId}`, { aadhaarHash: targetHash, isMock: true, phone: targetPhone }, 120)
      
      console.log(`[UIDAI OTP SIMULATION] Txn ID: ${txnId} | Hash: ${targetHash} | Mock OTP: ${mockOtp}`)

      // Try sending SMS via Twilio if phone is available
      if (targetPhone) {
        const messageBody = `LandChain Verification: Your Aadhaar Secure OTP is ${mockOtp}. Valid for 2 minutes.`
        sentSms = await sendTwilioSms(targetPhone, messageBody)
      }
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

      // Store session state in cache (valid for 120 seconds / 2 minutes)
      await cacheSet(`aadhaar_txn:${txnId}`, { aadhaarHash: targetHash, isMock: false, phone: targetPhone }, 120)
      sentSms = true // Real UIDAI handles SMS dispatch directly
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'OTP_INITIATED',
        entityId: txnId,
        entityType: 'AUTHENTICATION',
        actorId: 'anonymous',
        metadata: JSON.stringify({ txnId, isMock: !hasCertFiles, sentSms, phone: targetPhone ? 'yes' : 'no' }),
        timestamp: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      txnId, 
      mockOtp: sentSms ? null : mockOtp, // Hide mock OTP from frontend if SMS was dispatched successfully
      aadhaarHash: targetHash,
      sentSms
    })
  } catch (error: any) {
    console.error('UIDAI OTP Initiate failed:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
