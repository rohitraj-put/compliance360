import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pool } from '@/lib/db'
import { ApiError } from '@/lib/ApiError'
import { withErrorHandling } from '@/lib/apiHelpers'
import { signSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const SALT_ROUNDS = 12

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

export const POST = withErrorHandling(async (request) => {
  const body = await request.json()
  const { name, company, email, password } = body

  if (!name?.trim()) throw ApiError.badRequest('Name is required.')
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw ApiError.badRequest('A valid email is required.')
  if (!password || password.length < 6) throw ApiError.badRequest('Password must be at least 6 characters.')

  const cleanEmail = String(email).trim().toLowerCase()
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [cleanEmail])
  if (existing.length > 0) throw ApiError.conflict('An account with this email already exists.')

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const id = uuidv4()

  await pool.query(
    `INSERT INTO users (id, name, company, email, password_hash, role) VALUES (?, ?, ?, ?, ?, 'Company Admin')`,
    [id, name.trim(), (company || '').trim(), cleanEmail, passwordHash]
  )

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
  const token = await signSession({ id, email: cleanEmail, role: 'Company Admin' })

  const response = NextResponse.json({ user: sanitizeUser(rows[0]) }, { status: 201 })
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
  return response
})
