import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'

// Generate a secure key from JWT_SECRET or fallback
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'default_jwt_secret_min_32_chars_long_for_security'
  return crypto.createHash('sha256').update(secret).digest()
}

/**
 * Generates a SHA-256 hash of an Aadhaar number using a secret pepper.
 * Raw Aadhaar is never stored or logged.
 */
export function hashAadhaar(aadhaar: string): string {
  const cleanAadhaar = aadhaar.replace(/\s+/g, '')
  const pepper = process.env.AADHAAR_HASH_PEPPER || 'default_aadhaar_pepper_min_32_chars_long_for_security'
  return crypto.createHash('sha256')
    .update(cleanAadhaar + pepper)
    .digest('hex')
}

/**
 * Encrypts sensitive demographic data to pass securely in URL params or temporary sessions.
 */
export function encryptKycData(data: any): string {
  const key = getSecretKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `${iv.toString('hex')}:${encrypted}`
}

/**
 * Decrypts demographic data tokens.
 */
export function decryptKycData(token: string): any {
  try {
    const key = getSecretKey()
    const [ivHex, encryptedHex] = token.split(':')
    if (!ivHex || !encryptedHex) return null
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return JSON.parse(decrypted)
  } catch (error) {
    console.error('Failed to decrypt KYC data:', error)
    return null
  }
}
