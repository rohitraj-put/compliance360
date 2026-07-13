import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { pool } from '@/lib/db'
import { ApiError } from '@/lib/ApiError'
import { withErrorHandling, getUser } from '@/lib/apiHelpers'

export const dynamic = 'force-dynamic'

const SALT_ROUNDS = 12

export const PUT = withErrorHandling(async (request) => {
  const user = getUser(request)
  const { currentPassword, newPassword } = await request.json()

  if (!currentPassword || !newPassword) throw ApiError.badRequest('Current and new password are required.')
  if (newPassword.length < 6) throw ApiError.badRequest('New password must be at least 6 characters.')

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [user.id])
  const row = rows[0]
  if (!row) throw ApiError.notFound('User not found.')

  const matches = await bcrypt.compare(currentPassword, row.password_hash)
  if (!matches) throw ApiError.badRequest('Current password is incorrect.')

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, user.id])
  return NextResponse.json({ ok: true })
})
