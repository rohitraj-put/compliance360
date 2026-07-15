'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Topbar from '@/components/Topbar'
import StatCard from '@/components/StatCard'
import { useAppData } from '@/context/DataContext'
import Loading from '@/components/Loading'

export default function ConsultantPortal() {
  const { data, setCurrentCompanyId, loading } = useAppData()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return rows

    return rows.filter((r) => {
      const companyName = r.company.company_name?.toLowerCase() ?? ''
      const industry = r.company.industry?.toLowerCase() ?? ''
      return companyName.includes(term) || industry.includes(term)
    })
  }, [rows, searchTerm])

  const totals = filteredRows.reduce(
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

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Clients by Name or Industry"
            style={{ width: '100%', maxWidth: 320, background: 'var(--background)', padding: '0.75rem 1rem', border: '1px solid var(--border-strong)', borderRadius: 8 }}
          />
        </div>

        <div className="stat-grid">
          <StatCard label="Total Clients" value={totals.clients} />
          <StatCard label="Expiring Across Portfolio" value={totals.expiring} accent="amber" />
          <StatCard label="Overdue Across Portfolio" value={totals.overdue} accent="red" />
        </div>

        {loading ? (
          <div className="empty-state"><Loading message="Loading portfolio…" /></div>
        ) : filteredRows.length === 0 ? (
          <div className="panel"><div className="empty-state">
            <div className="empty-state-title">
              {searchTerm ? 'No matching clients found.' : 'No clients yet.'}
            </div>
            {searchTerm ? 'Try a different search term.' : 'Add companies to see them ranked here by urgency.'}
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
                  {filteredRows
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
