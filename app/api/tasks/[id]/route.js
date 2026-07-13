import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ApiError } from '@/lib/ApiError'
import { withErrorHandling, getUser } from '@/lib/apiHelpers'
import { getOwnedTaskOrFail } from '@/lib/ownership'

export const dynamic = 'force-dynamic'

export const PUT = withErrorHandling(async (request, { params }) => {
  const user = getUser(request)
  await getOwnedTaskOrFail(params.id, user.id)
  const { title, assigned_to, due_date, status } = await request.json()

  if (!title?.trim()) throw ApiError.badRequest('Title is required.')

  await pool.query(
    'UPDATE tasks SET title = ?, assigned_to = ?, due_date = ?, status = ? WHERE id = ?',
    [title.trim(), assigned_to || 'Consultant', due_date || null, status || 'Open', params.id]
  )

  const [rows] = await pool.query(
    'SELECT t.*, c.company_name FROM tasks t JOIN companies c ON c.id = t.company_id WHERE t.id = ?',
    [params.id]
  )
  return NextResponse.json({ task: rows[0] })
})

export const DELETE = withErrorHandling(async (request, { params }) => {
  const user = getUser(request)
  await getOwnedTaskOrFail(params.id, user.id)
  await pool.query('DELETE FROM tasks WHERE id = ?', [params.id])
  return new NextResponse(null, { status: 204 })
})
