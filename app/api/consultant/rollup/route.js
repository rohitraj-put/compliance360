import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { withErrorHandling, getUser } from '@/lib/apiHelpers'
import { deriveStatus } from '@/lib/complianceStatus'

export const dynamic = 'force-dynamic'

export const GET = withErrorHandling(async (request) => {
  const user = getUser(request)

  const [companies] = await pool.query('SELECT * FROM companies WHERE owner_user_id = ?', [user.id])
  const [records] = await pool.query(
    `SELECT r.* FROM compliance_records r JOIN companies c ON c.id = r.company_id WHERE c.owner_user_id = ?`,
    [user.id]
  )
  const [tasks] = await pool.query(
    `SELECT t.* FROM tasks t JOIN companies c ON c.id = t.company_id WHERE c.owner_user_id = ?`,
    [user.id]
  )

  const rows = companies.map((company) => {
    const companyRecords = records
      .filter((r) => r.company_id === company.id)
      .map((r) => ({ ...r, status: deriveStatus(r.expiry_date) }))
    const companyTasks = tasks.filter((t) => t.company_id === company.id)
    return {
      company,
      total: companyRecords.length,
      expiring: companyRecords.filter((r) => r.status === 'Expiring Soon').length,
      overdue: companyRecords.filter((r) => r.status === 'Overdue').length,
      openTasks: companyTasks.filter((t) => t.status !== 'Completed').length,
    }
  })

  rows.sort((a, b) => b.overdue - a.overdue || b.expiring - a.expiring)

  const totals = rows.reduce(
    (acc, r) => ({ clients: acc.clients + 1, expiring: acc.expiring + r.expiring, overdue: acc.overdue + r.overdue }),
    { clients: 0, expiring: 0, overdue: 0 }
  )

  return NextResponse.json({ rows, totals })
})
