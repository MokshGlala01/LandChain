import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { signJwt, SESSION_COOKIE_NAME } from '@/lib/auth-session'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const ROLE_MAP: Record<string, string> = {
  'citizen': 'CITIZEN',
  'bank officer': 'BANK',
  'bank': 'BANK',
  'registrar': 'REGISTRAR',
  'builder': 'BUILDER',
  'agricultural officer': 'AGRI',
  'agri': 'AGRI',
  'admin': 'ADMIN'
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

    if (user.status === 'PENDING_APPROVAL') {
      return NextResponse.json({ success: true, pendingApproval: true })
    }

    const token = await signJwt({
      userId: user.id,
      role: user.role,
      name: user.name
    }, '7d')

    const response = NextResponse.json({ success: true, role: user.role })
    
    response.headers.set(
      'Set-Cookie',
      `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
    )

    await prisma.auditLog.create({
      data: {
        action: 'LOGIN_SUCCESS',
        actorId: user.id,
        metadata: JSON.stringify({ method: 'UIDAI_OTP' })
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
      role,
      address,
      careOf,
      photo
    } = await req.json()

    if (!aadhaarHash || !name) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Map role
    const dbRole = ROLE_MAP[role?.toLowerCase()] || 'CITIZEN'

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { aadhaarHash }
    })

    if (user) {
      return NextResponse.json({ error: 'ACCOUNT_EXISTS' }, { status: 409 })
    }

    // Handle photo saving
    let photoUrl: string | null = null
    if (photo) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'users')
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
        }
        const buffer = Buffer.from(photo, 'base64')
        const fileName = `${aadhaarHash}.jpg`
        const filePath = path.join(uploadDir, fileName)
        fs.writeFileSync(filePath, buffer)
        photoUrl = `/uploads/users/${fileName}`
      } catch (err) {
        console.error('Failed to save profile photo:', err)
      }
    }

    const isCitizen = dbRole === 'CITIZEN'
    user = await prisma.user.create({
      data: {
        aadhaarHash,
        name,
        dob: dob ? new Date(dob) : new Date("1990-01-01"),
        gender: gender || "Male",
        role: dbRole,
        status: isCitizen ? 'ACTIVE' : 'PENDING_APPROVAL',
        address: address || "Not Provided",
        careOf: careOf || null,
        photoUrl: photoUrl || null,
        kycVerifiedAt: new Date(),
        kycMethod: 'UIDAI_OTP'
      }
    })

    if (user.status === 'PENDING_APPROVAL') {
      return NextResponse.json({ success: true, pendingApproval: true })
    }

    const token = await signJwt({
      userId: user.id,
      role: user.role,
      name: user.name
    }, '7d')

    const response = NextResponse.json({ success: true, role: user.role })
    response.headers.set(
      'Set-Cookie',
      `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
    )

    await prisma.auditLog.create({
      data: {
        action: 'USER_REGISTERED',
        actorId: user.id,
        metadata: JSON.stringify({ method: 'UIDAI_OTP' })
      }
    })

    return response
  } catch (error: any) {
    console.error('Session POST error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
