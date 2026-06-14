import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID || ''
  const isConfigured = clientId !== '' && !clientId.startsWith('paste_client_id_here')
  return NextResponse.json({ isConfigured })
}
