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

    const cachedAuth = await cacheGet(`aadhaar_auth:${txnId}`)
    if (!cachedAuth || cachedAuth.authCode !== authCode) {
      return NextResponse.json({ error: 'Invalid or expired auth session' }, { status: 401 })
    }

    let kycData: any = null

    if (cachedAuth.isMock) {
      // Mock validation logic
      kycData = getMockKycData(cachedAuth.aadhaarHash)
    } else {
      // Real eKYC endpoint fetch
      const kycXml = buildUidaiKycXml({
        txnId,
        authCode,
        auaCode: process.env.UIDAI_AUA_CODE || 'aua',
        kycMt: '1'
      })

      const signedXml = signXmlWithAuaCert(kycXml)

      const response = await fetch(process.env.UIDAI_KYC_URL || 'https://kycnet.uidai.gov.in/kyc/2.5/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml'
        },
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
        const poa = uidData.Poa[0].$
        const photo = uidData.Pht ? uidData.Pht[0] : ''

        const addressParts = [
          poa.co,
          poa.house,
          poa.street,
          poa.lm,
          poa.loc,
          poa.vtc,
          poa.dist,
          poa.state,
          poa.pc
        ].filter(Boolean)

        kycData = {
          name: poi.name,
          dob: poi.dob,
          gender: poi.gender === 'M' || poi.gender === 'Male' ? 'Male' : 'Female',
          address: addressParts.join(', '),
          photo: typeof photo === 'string' ? photo : ''
        }
      } else {
        throw new Error('Failed to parse eKYC response XML attributes')
      }
    }

    const phone = cachedAuth?.phone || null

    // Clear caches
    await cacheDel(`aadhaar_txn:${txnId}`)
    await cacheDel(`aadhaar_auth:${txnId}`)

    return NextResponse.json({
      success: true,
      name: kycData.name,
      dob: kycData.dob,
      gender: kycData.gender,
      address: kycData.address,
      photo: kycData.photo,
      phone
    })
  } catch (error: any) {
    console.error('UIDAI eKYC error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
