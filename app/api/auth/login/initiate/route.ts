import { NextRequest, NextResponse } from 'next/server'
import { hashAadhaar, verifyAadhaarChecksum, triggerUidaiOtp, mapUidaiError } from '@/lib/uidai'
import { cacheSet, cacheGet } from '@/lib/auth-cache'
import { prisma } from '@/lib/db'

async function rateLimit(key: string, limit: { max: number; window: string }) {
  const count = (await cacheGet(key)) || 0
  if (count >= limit.max) {
    throw new Error('TOO_MANY_REQUESTS')
  }
  await cacheSet(key, count + 1, 3600)
}

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

    if (!/^\d{12}$/.test(cleanAadhaar) || !verifyAadhaarChecksum(cleanAadhaar)) {
      return NextResponse.json({ error: 'INVALID_AADHAAR' }, { status: 400 })
    }

    const aadhaarHash = hashAadhaar(cleanAadhaar)

    // Check user exists BEFORE calling UIDAI
    const user = await prisma.user.findUnique({ where: { aadhaarHash } })
    if (!user) {
      return NextResponse.json({ error: 'ACCOUNT_NOT_FOUND' }, { status: 404 })
    }

    try {
      await rateLimit(`otp:${aadhaarHash}`, { max: 3, window: '1h' })
    } catch {
      return NextResponse.json({ error: 'TOO_MANY_REQUESTS' }, { status: 429 })
    }

    const result = await triggerUidaiOtp(cleanAadhaar, txnId)

    if (result.ret !== 'y') {
      return NextResponse.json({ 
        error: mapUidaiError(result.err),
        code: result.err,
        ...(process.env.NODE_ENV !== 'production' && { debug: result })
      }, { status: 400 })
    }

    // Cache transaction
    await cacheSet(`txn:${txnId}`, { aadhaarHash, mode: 'login', isMock: !!result.isMock }, 600)

    // Log initiate
    await prisma.auditLog.create({
      data: {
        action: 'OTP_INITIATED',
        entityId: txnId,
        entityType: 'AUTHENTICATION',
        actorId: user.id,
        metadata: JSON.stringify({ txnId, mode: 'login' })
      }
    })

    return NextResponse.json({ 
      success: true, 
      txnId,
      ...(process.env.NODE_ENV !== 'production' && { debug: result })
    })
  } catch (error: any) {
    console.error('Login initiate error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
