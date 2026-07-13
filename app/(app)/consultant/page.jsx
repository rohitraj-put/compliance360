'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Topbar from '@/components/Topbar'
import StatCard from '@/components/StatCard'
import { useAppData } from '@/context/DataContext'

export default function ConsultantPortal() {
  const { data, setCurrentCompanyId, loading } = useAppData()
  const router = useRouter()

  const rows = useMemo(() => {
    return data.companies.map((c) => {
      const records = data.records.filter((r) => r.company_id === c.id)
      const tasks = data.tasks.filter((t) => t.company_id === c.id)
      return {
        company: c,
        total: records.length,
        expiring: records.filter((r) => r.status === 'Expiring Soon').length,
        overdue: records.filter((r) => r.status === 'Overdue').length,
        openTasks: tasks.filter((t) => t.status !== 'Completed').length,
      }
    })
  }, [data])

  const totals = rows.reduce(
    (acc, r) => ({
      clients: acc.clients + 1,
      expiring: acc.expiring + r.expiring,
      overdue: acc.overdue + r.overdue,
    }),
    { clients: 0, expiring: 0, overdue: 0 }
  )

  const viewClient = (companyId) => {
    setCurrentCompanyId(companyId)
    router.push('/')
  }

  return (
    <>
      <Topbar eyebrow="Multi-Client Command Center" title="Consultant Portal" />
      <div className="content">
        <p className="section-intro">Every client under your firm&rsquo;s care, ranked by how urgently they need you.</p>

        <div className="stat-grid">
          <StatCard label="Total Clients" value={totals.clients} />
          <StatCard label="Expiring Across Portfolio" value={totals.expiring} accent="amber" />
          <StatCard label="Overdue Across Portfolio" value={totals.overdue} accent="red" />
        </div>

        {loading ? (
          <div className="empty-state">Loading portfolio…</div>
        ) : rows.length === 0 ? (
          <div className="panel"><div className="empty-state">
            <div className="empty-state-title">No clients yet.</div>
            Add companies to see them ranked here by urgency.
          </div></div>
        ) : (
          <div className="panel">
            <div className="panel-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Industry</th>
                    <th>Total Licenses</th>
                    <th>Expiring</th>
                    <th>Overdue</th>
                    <th>Open Tasks</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows
                    .slice()
                    .sort((a, b) => (b.overdue - a.overdue) || (b.expiring - a.expiring))
                    .map((r) => (
                      <tr key={r.company.id}>
                        <td><strong>{r.company.company_name}</strong></td>
                        <td>{r.company.industry}</td>
                        <td>{r.total}</td>
                        <td>{r.expiring}</td>
                        <td>{r.overdue}</td>
                        <td>{r.openTasks}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-outline" onClick={() => viewClient(r.company.id)}>
                            View Client
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
