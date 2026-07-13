import fs from 'fs'
import path from 'path'
import { ApiError } from './ApiError'

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
])

export function uploadDir() {
  const dir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

function safeName(originalName) {
  const ext = path.extname(originalName)
  const base = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 80)
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}${ext}`
}

export async function saveUploadedFile(file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw ApiError.badRequest('No file was uploaded.')
  }

  const maxBytes = (Number(process.env.MAX_UPLOAD_MB) || 10) * 1024 * 1024
  if (file.size > maxBytes) {
    throw ApiError.badRequest(`File is too large. Max size is ${process.env.MAX_UPLOAD_MB || 10}MB.`)
  }

  if (!ALLOWED_MIME.has(file.type)) {
    throw ApiError.badRequest(`Unsupported file type: ${file.type}. Allowed: PDF, DOC, DOCX, JPG, PNG, WEBP.`)
  }

  const filename = safeName(file.name || 'upload')
  const dir = uploadDir()
  const buffer = Buffer.from(await file.arrayBuffer())
  fs.writeFileSync(path.join(dir, filename), buffer)

  return {
    filename,
    urlPath: `/api/uploads/${filename}`,
    mimeType: file.type,
    sizeKb: Math.max(1, Math.round(file.size / 1024)),
    originalName: file.name || filename,
  }
}

export function deleteUploadedFile(urlPath) {
  if (!urlPath) return
  const filename = path.basename(urlPath)
  const filePath = path.join(uploadDir(), filename)
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') console.error('Could not delete file from disk:', err)
  })
}
