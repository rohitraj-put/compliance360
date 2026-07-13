import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ApiError } from '@/lib/ApiError'
import { withErrorHandling, getUser } from '@/lib/apiHelpers'
import { saveUploadedFile, deleteUploadedFile } from '@/lib/uploads'

export const dynamic = 'force-dynamic'

function sanitizeUser(row) {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    role: row.role,
    photo: row.photo_url,
    createdAt: row.created_at,
  }
}

export const GET = withErrorHandling(async (request) => {
  const user = getUser(request)
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [user.id])
  if (rows.length === 0) throw ApiError.notFound('User not found.')
  return NextResponse.json({ user: sanitizeUser(rows[0]) })
})

export const PUT = withErrorHandling(async (request) => {
  const user = getUser(request)
  const form = await request.formData()

  const name = form.get('name')
  const company = form.get('company')
  const email = form.get('email')
  const removePhoto = form.get('removePhoto') === 'true'
  const file = form.get('photo')

  const updates = []
  const params = []

  if (name !== null && name !== undefined) {
    if (!String(name).trim()) throw ApiError.badRequest('Name cannot be empty.')
    updates.push('name = ?')
    params.push(String(name).trim())
  }
  if (company !== null && company !== undefined) {
    updates.push('company = ?')
    params.push(String(company).trim())
  }
  if (email !== null && email !== undefined && email !== '') {
    const cleanEmail = String(email).trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) throw ApiError.badRequest('A valid email is required.')
    const [dupe] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1', [cleanEmail, user.id])
    if (dupe.length > 0) throw ApiError.conflict('Another account already uses this email.')
    updates.push('email = ?')
    params.push(cleanEmail)
  }

  const [currentRows] = await pool.query('SELECT * FROM users WHERE id = ?', [user.id])
  const current = currentRows[0]
  if (!current) throw ApiError.notFound('User not found.')

  if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
    const saved = await saveUploadedFile(file)
    if (current.photo_url) deleteUploadedFile(current.photo_url)
    updates.push('photo_url = ?')
    params.push(saved.urlPath)
  } else if (removePhoto && current.photo_url) {
    deleteUploadedFile(current.photo_url)
    updates.push('photo_url = ?')
    params.push(null)
  }

  if (updates.length > 0) {
    params.push(user.id)
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params)
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [user.id])
  return NextResponse.json({ user: sanitizeUser(rows[0]) })
})
