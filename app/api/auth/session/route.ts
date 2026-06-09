import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { signJwt, SESSION_COOKIE_NAME } from '@/lib/auth-session'

export const dynamic = 'force-dynamic'

const ROLE_MAP: Record<string, string> = {
  citizen: 'CITIZEN',
  builder: 'BUILDER',
  bank: 'BANK',
  registrar: 'REGISTRAR',
  agri: 'AGRI',
  admin: 'ADMIN',
  'bank officer': 'BANK',
  'agricultural officer': 'AGRI'
}

/**
 * GET - Login for returning users by Aadhaar hash
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const aadhaarHash = searchParams.get('aadhaarHash')

    if (!aadhaarHash) {
      return NextResponse.json({ error: 'Missing Aadhaar hash parameter' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { aadhaarHash }
    })

    if (!user) {
      return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 })
    }

    // Sign JWT
    const token = await signJwt({
      userId: user.id,
      role: user.role,
      name: user.name
    }, '7d')

    const response = NextResponse.json({ success: true, role: user.role })
    
    // Set cookie
    response.headers.set(
      'Set-Cookie',
      `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
    )

    // Log login
    await prisma.auditLog.create({
      data: {
        action: 'USER_LOGGED_IN',
        entityId: user.id,
        entityType: 'USER',
        actorId: user.id,
        metadata: JSON.stringify({ method: 'UIDAI_OTP' }),
        timestamp: new Date()
      }
    })

    return response
  } catch (error: any) {
    console.error('Session GET error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * POST - Register/Create User and issue session
 */
export async function POST(req: NextRequest) {
  try {
    const {
      aadhaarHash,
      name,
      dob,
      gender,
      email,
      role,
      language,
      uidaiTxnId
    } = await req.json()

    if (!aadhaarHash || !name) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Map role to standard format
    const dbRole = ROLE_MAP[role?.toLowerCase()] || 'CITIZEN'

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { aadhaarHash }
    })

    let isNewUser = false

    if (!user) {
      isNewUser = true
      user = await prisma.user.create({
        data: {
          aadhaarHash,
          name,
          dob: dob ? new Date(dob) : null,
          gender,
          email: email || null,
          role: dbRole,
          language: language || 'en',
          kycVerifiedAt: new Date(),
          kycMethod: uidaiTxnId ? 'UIDAI_OTP' : 'DIGILOCKER'
        }
      })
    }

    // Sign JWT
    const token = await signJwt({
      userId: user.id,
      role: user.role,
      name: user.name
    }, '7d')

    const response = NextResponse.json({ success: true, role: user.role, isNewUser })
    
    // Set secure cookie
    response.headers.set(
      'Set-Cookie',
      `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
    )

    // Log registration audit
    await prisma.auditLog.create({
      data: {
        action: isNewUser ? 'USER_REGISTERED' : 'USER_LOGGED_IN',
        entityId: user.id,
        entityType: 'USER',
        actorId: user.id,
        metadata: JSON.stringify({ method: uidaiTxnId ? 'UIDAI_OTP' : 'DIGILOCKER' }),
        timestamp: new Date()
      }
    })

    return response
  } catch (error: any) {
    console.error('Session POST error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
