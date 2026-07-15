import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ApiError } from '@/lib/ApiError'
import { withErrorHandling, getUser } from '@/lib/apiHelpers'
import { getOwnedCompanyOrFail } from '@/lib/ownership'

export const dynamic = 'force-dynamic'

export const GET = withErrorHandling(async (request, { params }) => {
  const user = getUser(request)
  const company = await getOwnedCompanyOrFail(params.id, user.id)
  return NextResponse.json({ company })
})

export const PUT = withErrorHandling(async (request, { params }) => {
  const user = getUser(request)
  await getOwnedCompanyOrFail(params.id, user.id)
  const { company_name, gst_number, contact_number, industry, state, employee_count } = await request.json()

  if (!company_name?.trim()) throw ApiError.badRequest('Company name is required.')

  await pool.query(
    `UPDATE companies SET company_name = ?, gst_number = ?, contact_number = ?, industry = ?, state = ?, employee_count = ?
     WHERE id = ? AND owner_user_id = ?`,
    [company_name.trim(), gst_number || null, contact_number || null, industry || null, state || null, Number(employee_count) || 0, params.id, user.id]
  )

  const company = await getOwnedCompanyOrFail(params.id, user.id)
  return NextResponse.json({ company })
})

export const DELETE = withErrorHandling(async (request, { params }) => {
  const user = getUser(request)
  await getOwnedCompanyOrFail(params.id, user.id)
  await pool.query('DELETE FROM companies WHERE id = ? AND owner_user_id = ?', [params.id, user.id])
  return new NextResponse(null, { status: 204 })
})
