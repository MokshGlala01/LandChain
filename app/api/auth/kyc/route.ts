import { NextRequest, NextResponse } from 'next/server'
import { cacheGet, cacheDel } from '@/lib/auth-cache'
import { buildUidaiKycXml, signXmlWithAuaCert, decryptKycResponse, getMockKycData } from '@/lib/uidai'
import { parseStringPromise } from 'xml2js'

export async function POST(req: NextRequest) {
  try {
    const { txnId, authCode } = await req.json()

    if (!txnId || !authCode) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const cachedAuth = await cacheGet(`auth:${txnId}`)
    if (!cachedAuth || cachedAuth.authCode !== authCode) {
      return NextResponse.json({ error: 'SESSION_EXPIRED' }, { status: 401 })
    }

    let kycData: any = null

    if (cachedAuth.isMock) {
      kycData = getMockKycData(cachedAuth.aadhaarHash)
    } else {
      const kycXml = buildUidaiKycXml({
        txnId,
        authCode,
        auaCode: process.env.UIDAI_AUA_CODE!,
        kycMt: '1'
      })

      const signedXml = signXmlWithAuaCert(kycXml)

      const response = await fetch(process.env.UIDAI_KYC_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: signedXml
      })

      if (!response.ok) {
        throw new Error(`UIDAI KYC gateway returned status ${response.status}`)
      }

      const rawXml = await response.text()
      const decryptedXml = decryptKycResponse(rawXml, process.env.UIDAI_P12_PATH)
      
      const parsed = await parseStringPromise(decryptedXml)
      if (parsed && parsed.KycRes && parsed.KycRes.UidData) {
        const uidData = parsed.KycRes.UidData[0]
        const poi = uidData.Poi[0].$
        const photo = uidData.Pht ? uidData.Pht[0] : ''
        
        kycData = {
          name: poi.name,
          dob: poi.dob,
          gender: poi.gender === 'M' || poi.gender === 'Male' ? 'Male' : 'Female',
          photo: typeof photo === 'string' ? photo : ''
        }
      } else {
        throw new Error('Failed to parse eKYC response XML attributes')
      }
    }

    // Clear caches
    await cacheDel(`txn:${txnId}`)
    await cacheDel(`auth:${txnId}`)

    return NextResponse.json({
      success: true,
      kyc: {
        name: kycData.name,
        dob: kycData.dob,
        gender: kycData.gender,
        photo: kycData.photo
      }
    })
  } catch (error: any) {
    console.error('API KYC error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
