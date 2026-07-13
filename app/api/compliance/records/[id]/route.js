import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ApiError } from '@/lib/ApiError'
import { withErrorHandling, getUser } from '@/lib/apiHelpers'
import { getOwnedRecordOrFail } from '@/lib/ownership'
import { deriveStatus } from '@/lib/complianceStatus'

export const dynamic = 'force-dynamic'

function withStatus(record) {
  return { ...record, status: deriveStatus(record.expiry_date) }
}

export const PUT = withErrorHandling(async (request, { params }) => {
  const user = getUser(request)
  await getOwnedRecordOrFail(params.id, user.id)
  const { compliance_type_id, issue_date, expiry_date, notes } = await request.json()

  if (!compliance_type_id) throw ApiError.badRequest('compliance_type_id is required.')
  if (!expiry_date) throw ApiError.badRequest('expiry_date is required.')

  await pool.query(
    `UPDATE compliance_records SET compliance_type_id = ?, issue_date = ?, expiry_date = ?, notes = ? WHERE id = ?`,
    [compliance_type_id, issue_date || null, expiry_date, notes || null, params.id]
  )

  const [rows] = await pool.query(
    `SELECT r.*, c.company_name, t.name AS compliance_type_name
     FROM compliance_records r
     JOIN companies c ON c.id = r.company_id
     JOIN compliance_types t ON t.id = r.compliance_type_id
     WHERE r.id = ?`,
    [params.id]
  )
  return NextResponse.json({ record: withStatus(rows[0]) })
})

export const DELETE = withErrorHandling(async (request, { params }) => {
  const user = getUser(request)
  await getOwnedRecordOrFail(params.id, user.id)
  await pool.query('DELETE FROM compliance_records WHERE id = ?', [params.id])
  return new NextResponse(null, { status: 204 })
})
