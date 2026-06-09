import { NextRequest, NextResponse } from 'next/server'
import { decryptKycData } from '@/lib/aadhaar-crypto'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    if (!token) {
      return NextResponse.json({ error: 'Missing token parameter' }, { status: 400 })
    }

    const decrypted = decryptKycData(token)
    if (!decrypted) {
      return NextResponse.json({ error: 'Invalid or corrupted token' }, { status: 400 })
    }

    return NextResponse.json(decrypted)
  } catch (error: any) {
    console.error('Demographic token decryption failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
