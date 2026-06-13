import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth-session'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session || (session.role !== 'REGISTRAR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Unauthorized access' }, { status: 401 })
    }

    const pendingUsers = await prisma.user.findMany({
      where: { kycStatus: 'PENDING_MANUAL_REVIEW' },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(pendingUsers)
  } catch (error: any) {
    console.error('Admin KYC GET error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session || (session.role !== 'REGISTRAR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Unauthorized access' }, { status: 401 })
    }

    const { userId, action, reason } = await req.json()

    if (!userId || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'INVALID_PARAMETERS', message: 'UserId and action (APPROVE/REJECT) are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'USER_NOT_FOUND', message: 'User not found' }, { status: 404 })
    }

    let updatedUser
    if (action === 'APPROVE') {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          kycStatus: 'VERIFIED',
          kycVerifiedAt: new Date(),
          status: 'ACTIVE' // Also ensure their account status is active
        }
      })
    } else {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          kycStatus: 'REJECTED',
          kycVerifiedAt: null
        }
      })
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: action === 'APPROVE' ? 'KYC_APPROVED' : 'KYC_REJECTED',
        entityId: userId,
        entityType: 'USER',
        actorId: session.userId,
        metadata: JSON.stringify({ reason: reason || 'N/A' })
      }
    })

    return NextResponse.json({ success: true, kycStatus: updatedUser.kycStatus })
  } catch (error: any) {
    console.error('Admin KYC action error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
