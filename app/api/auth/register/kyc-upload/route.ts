import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToIPFS } from '@/lib/ipfs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('aadhaarDoc') as File

    if (!file) {
      return NextResponse.json({ error: 'NO_FILE', message: 'No file uploaded' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'FILE_TOO_LARGE', message: 'File must be smaller than 5MB' }, { status: 400 })
    }

    const ipfsHash = await uploadFileToIPFS(file, file.name)
    return NextResponse.json({ success: true, ipfsHash })
  } catch (error: any) {
    console.error('KYC Upload error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: error.message || 'Failed to upload document' },
      { status: 500 }
    )
  }
}
