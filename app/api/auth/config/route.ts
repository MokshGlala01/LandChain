import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? ''
  const isConfigured =
    clientId !== '' &&
    !clientId.startsWith('paste_client_id_here') &&
    clientId.endsWith('.apps.googleusercontent.com')

  return NextResponse.json({ isConfigured })
}
