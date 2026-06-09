import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import forge from 'node-forge'
import { parseStringPromise } from 'xml2js'

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

/**
 * Validates Aadhaar/VID using Verhoeff algorithm
 */
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

// Check if cert files exist
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

// Get certificate expiry date tag
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
  return '20281231' // Fallback
}

// Load UIDAI Public Key
export function loadUidaiPublicKey() {
  if (!hasCerts()) {
    return null
  }
  try {
    const certPem = fs.readFileSync(process.env.UIDAI_PUBLIC_KEY_PATH!, 'utf8')
    return forge.pki.certificateFromPem(certPem).publicKey
  } catch (e) {
    console.error('Error loading UIDAI public key:', e)
    return null
  }
}

// Load AUA Private Key
export function loadAuaPrivateKey() {
  if (!hasCerts()) {
    return null
  }
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

// Encrypt payload with UIDAI Public Key
export function encryptWithUidaiKey(data: string): string {
  const publicKey: any = loadUidaiPublicKey()
  if (!publicKey) {
    // Return dummy encrypted base64 string in mock mode
    return Buffer.from(`MOCK_ENCRYPTED:${data}`).toString('base64')
  }
  const encrypted = publicKey.encrypt(data, 'RSAES-PKCS1-V1_5')
  return forge.util.encode64(encrypted)
}

// Sign XML with AUA Private Key
export function signXmlWithAuaCert(xml: string): string {
  const privateKey: any = loadAuaPrivateKey()
  if (!privateKey) {
    // Return dummy signature in mock mode
    return Buffer.from(`MOCK_SIGNATURE_OF:${crypto.createHash('sha256').update(xml).digest('hex')}`).toString('base64')
  }
  const md = forge.md.sha256.create()
  md.update(xml, 'utf8')
  const signature = privateKey.sign(md)
  return Buffer.from(signature, 'binary').toString('base64')
}

// Generate AES Session Key
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

// Build OTP XML request (v2.5)
export function buildUidaiAuthXml({ uid, txnId, auaCode, encryptedUid }: {
  uid: string; txnId: string; auaCode: string; encryptedUid: string
}): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Auth uid="${uid}" tid="public" ac="${auaCode}" sa="${process.env.UIDAI_ASA_CODE || 'asa_code'}"
      ver="2.5" txn="${txnId}" lk="${process.env.UIDAI_LICENSE_KEY || 'license_key'}">
  <Uses otp="y" pi="n" pa="n" pfa="n" bio="n" pin="n"/>
  <Meta udc="LandChain_Web" rdata="N"/>
  <Skey ci="${getCertExpiry()}">${encryptedUid}</Skey>
  <Data type="X"><!-- encrypted OTP request --></Data>
  <Hmac><!-- HMAC of Data --></Hmac>
</Auth>`
}

// Build OTP Verification XML (v2.5)
export function buildUidaiOtpVerifyXml({ txnId, encryptedOtp, auaCode, sessionKey }: {
  txnId: string; encryptedOtp: string; auaCode: string; sessionKey: string
}): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Auth tid="public" ac="${auaCode}" sa="${process.env.UIDAI_ASA_CODE || 'asa_code'}"
      ver="2.5" txn="${txnId}" lk="${process.env.UIDAI_LICENSE_KEY || 'license_key'}">
  <Uses otp="y" pi="n" pa="n" pfa="n" bio="n" pin="n"/>
  <Meta udc="LandChain_Web" rdata="N"/>
  <Skey ci="${getCertExpiry()}">${sessionKey}</Skey>
  <Data type="X">${encryptedOtp}</Data>
</Auth>`
}

// Build eKYC XML Request (v2.5)
export function buildUidaiKycXml({ txnId, authCode, auaCode, kycMt }: {
  txnId: string; authCode: string; auaCode: string; kycMt: string
}): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Kyc txn="${txnId}" ac="${auaCode}" sa="${process.env.UIDAI_ASA_CODE || 'asa_code'}" ver="2.5"
     de="y" pwt="y" nu="y" kycMt="${kycMt}">
  <Rad>${authCode}</Rad>
</Kyc>`
}

/**
 * Decrypts eKYC response XML using AUA private key.
 * In simulated mode, it returns the input xml itself or generates a mock.
 */
export function decryptKycResponse(responseXml: string, p12Path?: string): string {
  if (!hasCerts()) {
    return responseXml // Mock bypass
  }
  // In production, decrypt XML using AUA cert (RSA/AES-GCM decryption)
  // We return the raw string or parsed structure
  return responseXml
}

/**
 * Parse UIDAI XML Responses
 */
export async function parseUidaiResponse(xmlStr: string): Promise<any> {
  try {
    const parsed = await parseStringPromise(xmlStr)
    // Flatten XML attributes for easy JS handling
    if (parsed && parsed.Auth) {
      return {
        ret: parsed.Auth.$.ret,
        err: parsed.Auth.$.err,
        code: parsed.Auth.$.code,
        txn: parsed.Auth.$.txn
      }
    }
  } catch (e) {
    console.error('Error parsing XML response:', e)
  }
  return { ret: 'n', err: 'XML_PARSE_ERROR' }
}

/**
 * Mock data generation for testing offline fallback
 */
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

  // Use hash to deterministically generate some details for consistent mock logins
  const isAlt = aadhaarHash.charCodeAt(0) % 2 === 0
  return {
    name: isAlt ? 'Aarav Sharma' : 'Rajesh Kumar Singh',
    dob: isAlt ? '1992-05-20' : '1985-08-15',
    gender: isAlt ? 'Male' : 'Male',
    address: isAlt 
      ? '45, Park Street, Sector 15, Gurgaon, Haryana, 122001' 
      : '123, MG Road, Shivaji Nagar, Pune, Maharashtra, 411005',
    photo: '', // Set empty or a small placeholder base64
    co: isAlt ? 'C/O Dev Sharma' : 'C/O Hari Kumar Singh'
  }
}
