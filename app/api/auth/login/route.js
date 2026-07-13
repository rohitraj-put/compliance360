import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { pool } from '@/lib/db'
import { ApiError } from '@/lib/ApiError'
import { withErrorHandling } from '@/lib/apiHelpers'
import { signSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth'

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

export const POST = withErrorHandling(async (request) => {
  const { email, password } = await request.json()
  if (!email || !password) throw ApiError.badRequest('Email and password are required.')

  const cleanEmail = String(email).trim().toLowerCase()
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [cleanEmail])
  const row = rows[0]
  if (!row) throw ApiError.badRequest('Email or password is incorrect.')

  const matches = await bcrypt.compare(password, row.password_hash)
  if (!matches) throw ApiError.badRequest('Email or password is incorrect.')

  const token = await signSession({ id: row.id, email: row.email, role: row.role })
  const response = NextResponse.json({ user: sanitizeUser(row) })
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
  return response
})
