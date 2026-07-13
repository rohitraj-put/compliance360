import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { pool } from '@/lib/db'
import { ApiError } from '@/lib/ApiError'
import { withErrorHandling, getUser } from '@/lib/apiHelpers'
import { getOwnedCompanyOrFail } from '@/lib/ownership'
import { deriveStatus } from '@/lib/complianceStatus'

export const dynamic = 'force-dynamic'

function withStatus(record) {
  return { ...record, status: deriveStatus(record.expiry_date) }
}

export const GET = withErrorHandling(async (request) => {
  const user = getUser(request)
  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get('company_id')
  const status = searchParams.get('status')

  const params = [user.id]
  let sql = `
    SELECT r.*, c.company_name, t.name AS compliance_type_name
    FROM compliance_records r
    JOIN companies c ON c.id = r.company_id
    JOIN compliance_types t ON t.id = r.compliance_type_id
    WHERE c.owner_user_id = ?
  `
  if (companyId && companyId !== 'all') {
    sql += ' AND r.company_id = ?'
    params.push(companyId)
  }
  sql += ' ORDER BY r.expiry_date ASC'

  const [rows] = await pool.query(sql, params)
  let records = rows.map(withStatus)
  if (status) records = records.filter((r) => r.status === status)

  return NextResponse.json({ records })
})

export const POST = withErrorHandling(async (request) => {
  const user = getUser(request)
  const { company_id, compliance_type_id, issue_date, expiry_date, notes } = await request.json()

  if (!company_id) throw ApiError.badRequest('company_id is required.')
  if (!compliance_type_id) throw ApiError.badRequest('compliance_type_id is required.')
  if (!expiry_date) throw ApiError.badRequest('expiry_date is required.')

  await getOwnedCompanyOrFail(company_id, user.id)

  const [types] = await pool.query('SELECT id FROM compliance_types WHERE id = ?', [compliance_type_id])
  if (types.length === 0) throw ApiError.badRequest('Unknown compliance_type_id.')

  const id = uuidv4()
  await pool.query(
    `INSERT INTO compliance_records (id, company_id, compliance_type_id, issue_date, expiry_date, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, company_id, compliance_type_id, issue_date || null, expiry_date, notes || null]
  )

  const [rows] = await pool.query(
    `SELECT r.*, c.company_name, t.name AS compliance_type_name
     FROM compliance_records r
     JOIN companies c ON c.id = r.company_id
     JOIN compliance_types t ON t.id = r.compliance_type_id
     WHERE r.id = ?`,
    [id]
  )
  return NextResponse.json({ record: withStatus(rows[0]) }, { status: 201 })
})
