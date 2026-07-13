import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ApiError } from '@/lib/ApiError'
import { withErrorHandling, getUser } from '@/lib/apiHelpers'
import { getOwnedTaskOrFail } from '@/lib/ownership'

export const dynamic = 'force-dynamic'

const VALID = ['Open', 'In Progress', 'Completed']

export const PATCH = withErrorHandling(async (request, { params }) => {
  const user = getUser(request)
  await getOwnedTaskOrFail(params.id, user.id)
  const { status } = await request.json()

  if (!VALID.includes(status)) throw ApiError.badRequest(`status must be one of: ${VALID.join(', ')}.`)

  await pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, params.id])
  const [rows] = await pool.query(
    'SELECT t.*, c.company_name FROM tasks t JOIN companies c ON c.id = t.company_id WHERE t.id = ?',
    [params.id]
  )
  return NextResponse.json({ task: rows[0] })
})
