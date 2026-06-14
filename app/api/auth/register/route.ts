import { hashPassword } from '@/lib/password'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json()

    if (!name || !email || !password) {
      return Response.json({ message: 'All fields are required' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return Response.json({ message: 'An account with this email already exists. Please sign in.' }, { status: 409 })
    }

    const hashed = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: role ?? 'CITIZEN',
        status: (role ?? 'CITIZEN') === 'CITIZEN' ? 'ACTIVE' : 'PENDING_APPROVAL',
        kycStatus: 'VERIFIED', // Default verified for compatibility
        kycMethod: 'EMAIL'
      }
    })

    await prisma.auditLog.create({
      data: { 
        action: 'USER_REGISTERED', 
        actorId: user.id, 
        metadata: JSON.stringify({ method: 'EMAIL', role }) 
      }
    })

    return Response.json({ success: true, userId: user.id })
  } catch (error: any) {
    console.error('Registration API error:', error)
    return Response.json({ message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
