import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { pool } from '@/lib/db'
import { ApiError } from '@/lib/ApiError'
import { withErrorHandling, getUser } from '@/lib/apiHelpers'
import { getOwnedCompanyOrFail } from '@/lib/ownership'

export const dynamic = 'force-dynamic'

export const GET = withErrorHandling(async (request) => {
  const user = getUser(request)
  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get('company_id')
  const status = searchParams.get('status')

  const params = [user.id]
  let sql = `
    SELECT t.*, c.company_name
    FROM tasks t
    JOIN companies c ON c.id = t.company_id
    WHERE c.owner_user_id = ?
  `
  if (companyId && companyId !== 'all') { sql += ' AND t.company_id = ?'; params.push(companyId) }
  if (status) { sql += ' AND t.status = ?'; params.push(status) }
  sql += ' ORDER BY t.due_date ASC'

  const [rows] = await pool.query(sql, params)
  return NextResponse.json({ tasks: rows })
})

export const POST = withErrorHandling(async (request) => {
  const user = getUser(request)
  const { company_id, title, assigned_to, due_date, status } = await request.json()

  if (!company_id) throw ApiError.badRequest('company_id is required.')
  if (!title?.trim()) throw ApiError.badRequest('Title is required.')

  await getOwnedCompanyOrFail(company_id, user.id)

  const id = uuidv4()
  await pool.query(
    `INSERT INTO tasks (id, company_id, title, assigned_to, due_date, status) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, company_id, title.trim(), assigned_to || 'Consultant', due_date || null, status || 'Open']
  )

  const [rows] = await pool.query(
    'SELECT t.*, c.company_name FROM tasks t JOIN companies c ON c.id = t.company_id WHERE t.id = ?',
    [id]
  )
  return NextResponse.json({ task: rows[0] }, { status: 201 })
})
