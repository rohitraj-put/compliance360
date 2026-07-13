import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { withErrorHandling, getUser } from '@/lib/apiHelpers'
import { deriveStatus } from '@/lib/complianceStatus'

export const dynamic = 'force-dynamic'

export const GET = withErrorHandling(async (request) => {
  const user = getUser(request)
  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get('company_id')

  const recordParams = [user.id]
  let recordSql = `
    SELECT r.*, t.name AS compliance_type_name
    FROM compliance_records r
    JOIN companies c ON c.id = r.company_id
    JOIN compliance_types t ON t.id = r.compliance_type_id
    WHERE c.owner_user_id = ?
  `
  if (companyId && companyId !== 'all') { recordSql += ' AND r.company_id = ?'; recordParams.push(companyId) }
  const [records] = await pool.query(recordSql, recordParams)
  const withStatus = records.map((r) => ({ ...r, status: deriveStatus(r.expiry_date) }))

  const taskParams = [user.id]
  let taskSql = `SELECT t.* FROM tasks t JOIN companies c ON c.id = t.company_id WHERE c.owner_user_id = ?`
  if (companyId && companyId !== 'all') { taskSql += ' AND t.company_id = ?'; taskParams.push(companyId) }
  const [tasks] = await pool.query(taskSql, taskParams)

  const total = withStatus.length
  const active = withStatus.filter((r) => r.status === 'Active').length
  const expiring = withStatus.filter((r) => r.status === 'Expiring Soon').length
  const overdue = withStatus.filter((r) => r.status === 'Overdue').length
  const openTasks = tasks.filter((t) => t.status !== 'Completed').length
  const score = total === 0 ? 100 : Math.max(0, Math.round(100 - (overdue * 15 + expiring * 5)))

  const byType = {}
  withStatus.forEach((r) => { byType[r.compliance_type_name] = (byType[r.compliance_type_name] || 0) + 1 })

  const upcoming = withStatus
    .filter((r) => r.status !== 'Active')
    .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date))
    .slice(0, 6)

  return NextResponse.json({
    counts: { total, active, expiring, overdue, openTasks, score },
    byType: Object.entries(byType).map(([label, value]) => ({ label, value })),
    upcoming,
  })
})
