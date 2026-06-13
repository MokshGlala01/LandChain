import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'lc_session'

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || 'default_jwt_secret_min_32_chars_long_for_security'
  return new TextEncoder().encode(secret)
}

/**
 * Signs a payload into a JWT token
 */
export async function signJwt(payload: any, expiry: string = '7d'): Promise<string> {
  const secret = getJwtSecret()
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .sign(secret)
}

/**
 * Verifies a JWT token and returns the payload or null
 */
export async function verifyJwt(token: string): Promise<any | null> {
  try {
    const secret = getJwtSecret()
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    console.error('JWT Verification failed:', error)
    return null
  }
}

/**
 * Retrieves the verified session payload from cookies
 */
export async function getSession(req: NextRequest): Promise<any | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null
  return verifyJwt(token)
}

export function hashMobile(mobile: string): string {
  const cleanMobile = mobile.replace(/[^\d]/g, '')
  const pepper = process.env.AADHAAR_HASH_PEPPER || 'default_aadhaar_pepper_min_32_chars_long_for_security'
  return crypto.createHash('sha256').update(cleanMobile + pepper).digest('hex')
}
