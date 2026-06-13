import { NextRequest, NextResponse } from 'next/server'
import { cacheGet, cacheDel } from '@/lib/auth-cache'
import { buildUidaiKycXml, signXmlWithAuaCert, decryptKycResponse, getMockKycData, fetchUidaiEkyc } from '@/lib/uidai'

export async function POST(req: NextRequest) {
  try {
    const { txnId, authCode } = await req.json()

    if (!txnId || !authCode) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const cachedAuth = await cacheGet(`auth:${txnId}`)
    // If not cached under auth:${txnId}, check txn:${txnId}
    const cachedTxn = await cacheGet(`txn:${txnId}`)
    
    if (!cachedAuth && !cachedTxn) {
      return NextResponse.json({ error: 'SESSION_EXPIRED' }, { status: 401 })
    }

    const kycData = await fetchUidaiEkyc(txnId, authCode)

    // Clear caches
    await cacheDel(`txn:${txnId}`)
    await cacheDel(`auth:${txnId}`)

    return NextResponse.json({
      success: true,
      kyc: kycData
    })
  } catch (error: any) {
    console.error('API register KYC error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
