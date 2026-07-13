import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { pool } from '@/lib/db'
import { ApiError } from '@/lib/ApiError'
import { withErrorHandling, getUser } from '@/lib/apiHelpers'
import { getOwnedCompanyOrFail } from '@/lib/ownership'

export const dynamic = 'force-dynamic'

export const GET = withErrorHandling(async (request) => {
  const user = getUser(request)
  const [rows] = await pool.query(
    `SELECT c.*,
            (SELECT COUNT(*) FROM compliance_records r WHERE r.company_id = c.id) AS license_count
     FROM companies c
     WHERE c.owner_user_id = ?
     ORDER BY c.company_name ASC`,
    [user.id]
  )
  return NextResponse.json({ companies: rows })
})

export const POST = withErrorHandling(async (request) => {
  const user = getUser(request)
  const { company_name, gst_number, industry, state, employee_count } = await request.json()

  if (!company_name?.trim()) throw ApiError.badRequest('Company name is required.')

  const id = uuidv4()
  await pool.query(
    `INSERT INTO companies (id, owner_user_id, company_name, gst_number, industry, state, employee_count)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, user.id, company_name.trim(), gst_number || null, industry || null, state || null, Number(employee_count) || 0]
  )

  const company = await getOwnedCompanyOrFail(id, user.id)
  return NextResponse.json({ company }, { status: 201 })
})
