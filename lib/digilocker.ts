import crypto from 'crypto'
import { parseStringPromise } from 'xml2js'

export interface DigiLockerProfile {
  sub: string;
  name: string;
  dob: string;
  gender: string;
}

export interface DigiLockerKycData {
  name: string;
  dob: string;
  gender: string;
  address: string;
  photo: string;
}

/**
 * Generate PKCE verifier and S256 challenge code
 */
export function generatePKCE() {
  const verifier = crypto
    .randomBytes(32)
    .toString('base64url')
  
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url')

  return { verifier, challenge }
}

/**
 * Checks if DigiLocker configuration keys are present
 */
export function isDigiLockerConfigured(): boolean {
  return (
    !!process.env.DIGILOCKER_CLIENT_ID &&
    process.env.DIGILOCKER_CLIENT_ID !== 'your_client_id' &&
    !!process.env.DIGILOCKER_CLIENT_SECRET
  )
}

/**
 * Get DigiLocker Authorize Redirect URL
 */
export function getDigiLockerAuthUrl(state: string, challenge: string): string {
  const authUrl = process.env.DIGILOCKER_AUTH_URL || 'https://digilocker.gov.in/public/oauth2/1/authorize'
  const redirectUri = process.env.DIGILOCKER_REDIRECT_URI || 'http://localhost:3000/api/auth/digilocker/callback'
  const clientId = process.env.DIGILOCKER_CLIENT_ID || 'mock_client_id'

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    scope: 'openid profile',
    dl_flow: 'signup'
  })

  return `${authUrl}?${params.toString()}`
}

/**
 * Exchange Authorization Code for Token
 */
export async function exchangeCodeForToken(code: string, verifier: string): Promise<string | null> {
  if (!isDigiLockerConfigured()) {
    return 'mock_access_token'
  }

  try {
    const tokenUrl = process.env.DIGILOCKER_TOKEN_URL || 'https://api.digitallocker.gov.in/public/oauth2/1/token'
    const redirectUri = process.env.DIGILOCKER_REDIRECT_URI || 'http://localhost:3000/api/auth/digilocker/callback'
    
    const params = new URLSearchParams({
      code,
      client_id: process.env.DIGILOCKER_CLIENT_ID!,
      client_secret: process.env.DIGILOCKER_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code_verifier: verifier
    })

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('DigiLocker token exchange error:', errText)
      return null
    }

    const data = await res.json()
    return data.access_token || null
  } catch (error) {
    console.error('DigiLocker token exchange network error:', error)
    return null
  }
}

/**
 * Fetch DigiLocker user profile
 */
export async function fetchDigiLockerProfile(accessToken: string): Promise<DigiLockerProfile | null> {
  if (accessToken === 'mock_access_token') {
    return {
      sub: 'dl_mock_user_12345',
      name: 'Rajesh Kumar Singh',
      dob: '15/08/1985',
      gender: 'M'
    }
  }

  try {
    const res = await fetch('https://api.digitallocker.gov.in/public/oauth2/1/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!res.ok) {
      console.error('Failed to fetch DigiLocker profile:', await res.text())
      return null
    }

    return await res.json()
  } catch (error) {
    console.error('Failed to fetch DigiLocker profile:', error)
    return null
  }
}

/**
 * Fetch eaadhaar XML from DigiLocker
 */
export async function fetchDigiLockerAadhaar(accessToken: string): Promise<string | null> {
  if (accessToken === 'mock_access_token') {
    // Return mock XML
    return `<?xml version="1.0" encoding="UTF-8"?>
<KycRes>
  <UidData>
    <Poi name="Rajesh Kumar Singh" dob="1985-08-15" gender="M" />
    <Poa co="C/O Hari Kumar Singh" house="123" street="MG Road" loc="Shivaji Nagar" vtc="Pune" dist="Pune" state="Maharashtra" pc="411005" />
    <Pht></Pht>
  </UidData>
</KycRes>`
  }

  try {
    const res = await fetch('https://api.digitallocker.gov.in/public/oauth2/1/xml/eaadhaar', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!res.ok) {
      console.error('Failed to fetch DigiLocker eaadhaar:', await res.text())
      return null
    }

    return await res.text()
  } catch (error) {
    console.error('Failed to fetch DigiLocker eaadhaar:', error)
    return null
  }
}

/**
 * Parse eAadhaar XML returned from DigiLocker API
 */
export async function parseDigiLockerKycXml(xmlStr: string): Promise<DigiLockerKycData | null> {
  try {
    const parsed = await parseStringPromise(xmlStr)
    if (parsed && parsed.KycRes && parsed.KycRes.UidData) {
      const uidData = parsed.KycRes.UidData[0]
      const poi = uidData.Poi[0].$
      const poa = uidData.Poa[0].$
      const photo = uidData.Pht ? uidData.Pht[0] : ''

      // Build address string
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

      return {
        name: poi.name,
        dob: poi.dob,
        gender: poi.gender === 'M' || poi.gender === 'Male' ? 'Male' : 'Female',
        address: addressParts.join(', '),
        photo: typeof photo === 'string' ? photo : ''
      }
    }
  } catch (error) {
    console.error('Error parsing DigiLocker eaadhaar XML:', error)
  }
  return null
}
