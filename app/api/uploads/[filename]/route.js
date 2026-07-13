import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import { uploadDir } from '@/lib/uploads'

export const dynamic = 'force-dynamic'

const MIME_BY_EXT = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

export async function GET(request, { params }) {
  const filename = path.basename(params.filename) // prevent path traversal
  const filePath = path.join(uploadDir(), filename)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found.' }, { status: 404 })
  }

  const buffer = fs.readFileSync(filePath)
  const ext = path.extname(filename).toLowerCase()
  const contentType = MIME_BY_EXT[ext] || 'application/octet-stream'

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
