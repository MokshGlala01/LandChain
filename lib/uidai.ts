import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import forge from 'node-forge'
import { parseStringPromise } from 'xml2js'
import { cacheSet, cacheGet } from '@/lib/auth-cache'

// Verhoeff algorithm matrices
const dMatrix = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
]

const pMatrix = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
]

export function verifyAadhaarChecksum(aadhaar: string): boolean {
  const clean = aadhaar.replace(/\s+/g, '')
  if (!/^\d{12}$/.test(clean) && !/^\d{16}$/.test(clean)) {
    return false
  }
  let c = 0
  const digits = clean.split('').reverse().map(Number)
  digits.forEach((digit, i) => {
    c = dMatrix[c][pMatrix[i % 8][digit]]
  })
  return c === 0
}

export function hashAadhaar(aadhaar: string): string {
  const cleanAadhaar = aadhaar.replace(/\s+/g, '')
  const pepper = process.env.AADHAAR_HASH_PEPPER || 'default_aadhaar_pepper_min_32_chars_long_for_security'
  return crypto.createHash('sha256').update(cleanAadhaar + pepper).digest('hex')
}

const hasCerts = () => {
  const certPath = process.env.UIDAI_PUBLIC_KEY_PATH
  const p12Path = process.env.UIDAI_P12_PATH
  return (
    certPath &&
    p12Path &&
    fs.existsSync(certPath) &&
    fs.existsSync(p12Path)
  )
}

export function getCertExpiry(): string {
  try {
    if (hasCerts()) {
      const certPem = fs.readFileSync(process.env.UIDAI_PUBLIC_KEY_PATH!, 'utf8')
      const cert = forge.pki.certificateFromPem(certPem)
      const notAfter = cert.validity.notAfter
      const year = notAfter.getFullYear()
      const month = String(notAfter.getMonth() + 1).padStart(2, '0')
      const day = String(notAfter.getDate()).padStart(2, '0')
      return `${year}${month}${day}`
    }
  } catch (e) {
    console.error('Error reading cert expiry:', e)
  }
  return '20281231'
}

export function loadUidaiPublicKey() {
  if (!hasCerts()) return null
  try {
    const certPem = fs.readFileSync(process.env.UIDAI_PUBLIC_KEY_PATH!, 'utf8')
    return forge.pki.certificateFromPem(certPem).publicKey
  } catch (e) {
    console.error('Error loading UIDAI public key:', e)
    return null
  }
}

export function loadAuaPrivateKey() {
  if (!hasCerts()) return null
  try {
    const p12Der = fs.readFileSync(process.env.UIDAI_P12_PATH!)
    const p12Asn1 = forge.asn1.fromDer(p12Der.toString('binary'))
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, process.env.UIDAI_P12_PASSWORD || '')
    const bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })
    const keyBag = bags[forge.pki.oids.pkcs8ShroudedKeyBag]
    if (keyBag && keyBag[0]) {
      return keyBag[0].key
    }
  } catch (e) {
    console.error('Error loading AUA private key:', e)
  }
  return null
}

export function encryptWithUidaiKey(data: string): string {
  const publicKey: any = loadUidaiPublicKey()
  if (!publicKey) {
    return Buffer.from(`MOCK_ENCRYPTED:${data}`).toString('base64')
  }
  const encrypted = publicKey.encrypt(data, 'RSAES-PKCS1-V1_5')
  return forge.util.encode64(encrypted)
}

export function signXmlWithAuaCert(xml: string): string {
  const privateKey: any = loadAuaPrivateKey()
  if (!privateKey) {
    return Buffer.from(`MOCK_SIGNATURE_OF:${crypto.createHash('sha256').update(xml).digest('hex')}`).toString('base64')
  }
  const md = forge.md.sha256.create()
  md.update(xml, 'utf8')
  const signature = privateKey.sign(md)
  return Buffer.from(signature, 'binary').toString('base64')
}

export function generateSessionKey(): { rawKey: Buffer; encryptedKey: string } {
  const rawKey = crypto.randomBytes(32)
  const publicKey: any = loadUidaiPublicKey()
  if (!publicKey) {
    const encKey = Buffer.from(`MOCK_SESSION_KEY:${rawKey.toString('hex')}`).toString('base64')
    return { rawKey, encryptedKey: encKey }
  }
  const encrypted = publicKey.encrypt(rawKey.toString('binary'), 'RSAES-PKCS1-V1_5')
  return { rawKey, encryptedKey: forge.util.encode64(encrypted) }
}

export function buildUidaiAuthXml({ uid, txnId, auaCode, encryptedUid }: {
  uid: string; txnId: string; auaCode: string; encryptedUid: string
}): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Auth uid="${uid}" tid="public" ac="${auaCode}" sa="${process.env.UIDAI_ASA_CODE || 'asa_code'}"
      ver="2.5" txn="${txnId}" lk="${process.env.UIDAI_LICENSE_KEY || 'license_key'}">
  <Uses otp="y" pi="n" pa="n" pfa="n" bio="n" bt="" pin="n"/>
  <Meta udc="LandChain_Web" rdata="N"/>
  <Skey ci="${getCertExpiry()}">${encryptedUid}</Skey>
  <Data type="X"><!-- encrypted OTP request --></Data>
  <Hmac><!-- HMAC of Data --></Hmac>
</Auth>`
}

export function buildUidaiOtpVerifyXml({ txnId, encryptedOtp, auaCode, sessionKey }: {
  txnId: string; encryptedOtp: string; auaCode: string; sessionKey: string
}): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Auth tid="public" ac="${auaCode}" sa="${process.env.UIDAI_ASA_CODE || 'asa_code'}"
      ver="2.5" txn="${txnId}" lk="${process.env.UIDAI_LICENSE_KEY || 'license_key'}">
  <Uses otp="y" pi="n" pa="n" pfa="n" bio="n" bt="" pin="n"/>
  <Meta udc="LandChain_Web" rdata="N"/>
  <Skey ci="${getCertExpiry()}">${sessionKey}</Skey>
  <Data type="X">${encryptedOtp}</Data>
</Auth>`
}

export function buildUidaiOtpReqXml({ uid, txnId, auaCode }: {
  uid: string; txnId: string; auaCode: string
}): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<OtpReq uid="${uid}" tid="public" ac="${auaCode}" sa="${process.env.UIDAI_ASA_CODE || 'asa_code'}"
        ver="2.5" txn="${txnId}" lk="${process.env.UIDAI_LICENSE_KEY || 'license_key'}" type="A">
  <Opts ch="01"/>
</OtpReq>`
}

export function buildUidaiKycXml({ txnId, authCode, auaCode, kycMt }: {
  txnId: string; authCode: string; auaCode: string; kycMt?: string
}): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Kyc txn="${txnId}" ac="${auaCode}" sa="${process.env.UIDAI_ASA_CODE || 'asa_code'}" ver="2.5"
     de="y" pwt="y" nu="y" kycMt="1">
  <Rad>${authCode}</Rad>
</Kyc>`
}

export function decryptKycResponse(responseXml: string, p12Path?: string): string {
  return responseXml
}

export async function parseUidaiResponse(xmlStr: string): Promise<any> {
  try {
    const parsed = await parseStringPromise(xmlStr)
    if (parsed) {
      if (parsed.Auth) {
        return {
          ret: parsed.Auth.$.ret,
          err: parsed.Auth.$.err,
          code: parsed.Auth.$.code,
          txn: parsed.Auth.$.txn
        }
      }
      if (parsed.OtpRes) {
        return {
          ret: parsed.OtpRes.$.ret,
          err: parsed.OtpRes.$.err,
          txn: parsed.OtpRes.$.txn
        }
      }
    }
  } catch (e) {
    console.error('Error parsing XML response:', e)
  }
  return { ret: 'n', err: 'XML_PARSE_ERROR' }
}

export function mapUidaiError(code: string): string {
  const errors: Record<string, string> = {
    '100': 'Invalid Aadhaar number / VID',
    '200': 'Authentication failed — invalid biometric/OTP data structure',
    '300': 'UIDAI system error — please try again later',
    '400': 'Authentication unsuccessful — invalid demographic/OTP data',
    '401': 'Decryption error — check UIDAI public certificate is correct',
    '402': 'Encryption error in our request',
    '403': 'Invalid AUA license key — check UIDAI_LICENSE_KEY',
    '500': 'Invalid AUA — check UIDAI_AUA_CODE',
    '510': 'Duplicate request — txnId already used',
    '530': 'Invalid request format / XML schema error',
    '569': 'Invalid OTP entered',
    '570': 'OTP expired',
    '571': 'OTP already used',
    '572': 'Too many OTP attempts — Aadhaar locked temporarily',
    '800': 'PID (Personal Identity Data) XML parsing failed',
    '811': 'OTP value did not match — request a new OTP',
    '930': 'Invalid Aadhaar number format',
    '940': 'Mobile number not registered with this Aadhaar — UIDAI cannot deliver OTP. User must update mobile at Aadhaar Seva Kendra.',
    '941': 'OTP request limit exceeded for this Aadhaar — wait before retrying',
    '942': 'OTP not generated — invalid input',
    '980': 'Invalid biometric data',
    '986': 'Invalid request — AUA not authorized for OTP auth type'
  }
  return errors[code] ?? `Unknown UIDAI error: ${code}`
}

export async function triggerUidaiOtp(aadhaar: string, txnId: string): Promise<any> {
  if (!hasCerts()) {
    // Simulator Mode
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString()
    await cacheSet(`otp:${txnId}`, mockOtp, 600)
    console.log(`[UIDAI SIMULATOR] Dispatched OTP ${mockOtp} for txnId ${txnId}`)
    return { ret: 'y', txn: txnId, isMock: true }
  }

  const xml = buildUidaiOtpReqXml({
    uid: aadhaar,
    txnId,
    auaCode: process.env.UIDAI_AUA_CODE!
  })
  
  const otpUrl = process.env.UIDAI_OTP_GENERATE_URL || 
                 process.env.UIDAI_AUTH_URL?.replace(/\/1\.6\//, '/otp/2.5/') || 
                 process.env.UIDAI_AUTH_URL?.replace(/\/2\.5\//, '/otp/2.5/') || 
                 'https://auth.uidai.gov.in/otp/2.5/'

  console.log('🔍 Triggering UIDAI OTP request via URL:', otpUrl)

  const response = await fetch(otpUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml' },
    body: signXmlWithAuaCert(xml)
  })

  if (!response.ok) {
    throw new Error(`UIDAI OTP gateway returned status ${response.status}`)
  }

  const rawText = await response.text()
  console.log('🔍 UIDAI raw response:', rawText)
  console.log('🔍 UIDAI HTTP status:', response.status)

  const result = await parseUidaiResponse(rawText)
  console.log('🔍 Parsed result:', result)

  return result
}

export function validateUidaiCerts() {
  if (hasCerts()) {
    try {
      const p12Der = fs.readFileSync(process.env.UIDAI_P12_PATH!)
      const p12Asn1 = forge.asn1.fromDer(p12Der.toString('binary'))
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, process.env.UIDAI_P12_PASSWORD || '')
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })
      const certBag = certBags[forge.pki.oids.certBag]
      const auaCert = certBag && certBag[0] ? certBag[0].cert : null

      const uidaiCertPem = fs.readFileSync(process.env.UIDAI_PUBLIC_KEY_PATH!, 'utf8')
      const uidaiCert = forge.pki.certificateFromPem(uidaiCertPem)

      if (!auaCert || !uidaiCert) {
        console.error('❌ UIDAI certificates failed to load — check UIDAI_P12_PATH and UIDAI_PUBLIC_KEY_PATH')
      } else {
        console.log('✅ UIDAI certs loaded successfully')
        console.log(`🔒 AUA Cert Validity: ${auaCert.validity.notBefore} to ${auaCert.validity.notAfter}`)
        console.log(`🔒 UIDAI Public Cert Validity: ${uidaiCert.validity.notBefore} to ${uidaiCert.validity.notAfter}`)
      }
    } catch (err) {
      console.error('❌ Error validating UIDAI certificates:', err)
    }
  } else {
    console.log('⚠️ Running in UIDAI Simulator Mode — certs not loaded.')
  }
}

// Run validation on module boot
try {
  validateUidaiCerts()
} catch (err) {
  console.error('Failed to validate UIDAI certificates on boot:', err)
}

export async function verifyUidaiOtp(txnId: string, otp: string): Promise<any> {
  if (!hasCerts()) {
    const expected = await cacheGet(`otp:${txnId}`)
    if (expected && expected === otp) {
      return { ret: 'y', code: `MOCK_AUTH_CODE_${txnId}` }
    }
    return { ret: 'n', err: '569' }
  }

  const { encryptedKey } = generateSessionKey()
  const xml = buildUidaiOtpVerifyXml({
    txnId,
    encryptedOtp: encryptWithUidaiKey(otp),
    auaCode: process.env.UIDAI_AUA_CODE!,
    sessionKey: encryptedKey
  })

  const response = await fetch(process.env.UIDAI_AUTH_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml' },
    body: signXmlWithAuaCert(xml)
  })

  if (!response.ok) {
    throw new Error(`UIDAI gateway returned status ${response.status}`)
  }

  const xmlText = await response.text()
  return parseUidaiResponse(xmlText)
}

export async function fetchUidaiEkyc(txnId: string, authCode: string): Promise<any> {
  const cachedTxn = await cacheGet(`txn:${txnId}`)
  const hash = cachedTxn?.aadhaarHash || 'aadhaar_123456789012'

  if (!hasCerts()) {
    const mock = getMockKycData(hash)
    return {
      name: mock.name,
      dob: mock.dob,
      gender: mock.gender,
      address: mock.address,
      careOf: mock.co,
      photo: mock.photo
    }
  }

  const xml = buildUidaiKycXml({
    txnId,
    authCode,
    auaCode: process.env.UIDAI_AUA_CODE!
  })

  const response = await fetch(process.env.UIDAI_KYC_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml' },
    body: signXmlWithAuaCert(xml)
  })

  if (!response.ok) {
    throw new Error(`UIDAI KYC gateway returned status ${response.status}`)
  }

  const responseXml = await response.text()

  // 1. Check top-level response status FIRST
  const topLevel = await parseStringPromise(responseXml)
  if (!topLevel || !topLevel.KycRes || !topLevel.KycRes.$) {
    throw new Error('Invalid XML response from UIDAI eKYC')
  }
  if (topLevel.KycRes.$.ret !== 'y') {
    throw new Error(`eKYC failed: ${topLevel.KycRes.$.code ?? 'unknown error'}`)
  }

  // 2. Decrypt actual KYC data block
  const decryptedXml = decryptKycResponse(responseXml, process.env.UIDAI_P12_PATH)
  const parsed = await parseStringPromise(decryptedXml)

  let poi: any = {}
  let poa: any = {}
  let photo = ''

  if (parsed && parsed.KycRes) {
    const kycRes = parsed.KycRes
    const rar = kycRes.Rar ? kycRes.Rar[0] : (parsed.Rar ? parsed.Rar : null)
    if (rar) {
      poi = rar.Poi?.[0]?.$ ?? {}
      poa = rar.Poa?.[0]?.$ ?? {}
      photo = rar.Pht?.[0] ?? ''
    } else if (kycRes.UidData) {
      const uidData = kycRes.UidData[0]
      poi = uidData.Poi?.[0]?.$ ?? {}
      poa = uidData.Poa?.[0]?.$ ?? {}
      photo = uidData.Pht ? uidData.Pht[0] : ''
    } else {
      throw new Error('eKYC response has no recognizable user data tags (<Rar> or <UidData>)')
    }
  } else {
    throw new Error('Failed to parse decrypted eKYC payload')
  }

  // Helper date parsing (DD-MM-YYYY -> ISO YYYY-MM-DD)
  const formatKycDate = (dateStr: string) => {
    if (!dateStr) return ''
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-')
      if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4) {
        const [day, month, year] = parts
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
    }
    return dateStr
  }

  // Helper gender mapping (M/F/T -> Male/Female/Other)
  const formatKycGender = (code: string) => {
    const mapping: Record<string, string> = { M: 'Male', F: 'Female', T: 'Other', Male: 'Male', Female: 'Female' }
    return mapping[code] ?? 'Other'
  }

  // Helper address mapping
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
    name: poi.name ?? 'Not Provided',
    dob: formatKycDate(poi.dob),
    gender: formatKycGender(poi.gender),
    address: addressParts.join(', ') || 'Not Provided',
    careOf: poa.co || '',
    photo: typeof photo === 'string' ? photo : ''
  }
}

export function getMockKycData(aadhaarHash: string) {
  const pepper = process.env.AADHAAR_HASH_PEPPER || 'default_aadhaar_pepper_min_32_chars_long_for_security'
  const hash1234 = crypto.createHash('sha256').update('123456789012' + pepper).digest('hex')
  const hash8888 = crypto.createHash('sha256').update('888888888888' + pepper).digest('hex')
  const hash7777 = crypto.createHash('sha256').update('777777777777' + pepper).digest('hex')

  if (aadhaarHash === 'aadhaar_123456789012' || aadhaarHash === hash1234) {
    return {
      name: 'Rohan Sharma',
      dob: '1990-01-01',
      gender: 'Male',
      address: 'Sector 62, Noida, Uttar Pradesh, 201301',
      photo: '',
      co: 'C/O Sharma'
    }
  }
  if (aadhaarHash === 'aadhaar_888888888888' || aadhaarHash === hash8888) {
    return {
      name: 'Officer Amit Kumar',
      dob: '1980-04-12',
      gender: 'Male',
      address: 'Government Quarters, Sector 2, Noida, Uttar Pradesh, 201301',
      photo: '',
      co: 'C/O India'
    }
  }
  if (aadhaarHash === 'aadhaar_777777777777' || aadhaarHash === hash7777) {
    return {
      name: 'SBI Verifier Officer',
      dob: '1985-09-25',
      gender: 'Male',
      address: 'SBI Building, Shivaji Nagar, Pune, Maharashtra, 411005',
      photo: '',
      co: 'C/O State Bank of India'
    }
  }

  const isAlt = aadhaarHash.charCodeAt(0) % 2 === 0
  return {
    name: isAlt ? 'Aarav Sharma' : 'Rajesh Kumar Singh',
    dob: isAlt ? '1992-05-20' : '1985-08-15',
    gender: isAlt ? 'Male' : 'Male',
    address: isAlt 
      ? '45, Park Street, Sector 15, Gurgaon, Haryana, 122001' 
      : '123, MG Road, Shivaji Nagar, Pune, Maharashtra, 411005',
    photo: '',
    co: isAlt ? 'C/O Dev Sharma' : 'C/O Hari Kumar Singh'
  }
}
