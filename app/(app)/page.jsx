'use client'

import { useMemo } from 'react'
import Topbar from '@/components/Topbar'
import StatCard from '@/components/StatCard'
import { useAppData } from '@/context/DataContext'
import { Donut, BarList, COLORS } from '@/components/charts/SimpleCharts'
import { formatDate } from '@/lib/date'
import { StatusPill } from '@/components/StampBadge'
import Loading from '@/components/Loading'

export default function Dashboard() {
  const { scopedRecords, scopedTasks, companyName, complianceTypeName, loading } = useAppData()

  const counts = useMemo(() => {
    const total = scopedRecords.length
    const expiring = scopedRecords.filter((r) => r.status === 'Expiring Soon').length
    const overdue = scopedRecords.filter((r) => r.status === 'Overdue').length
    const active = scopedRecords.filter((r) => r.status === 'Active').length
    const openTasks = scopedTasks.filter((t) => t.status !== 'Completed').length
    const score = total === 0 ? 100 : Math.max(0, Math.round(100 - (overdue * 15 + expiring * 5)))
    return { total, expiring, overdue, active, openTasks, score }
  }, [scopedRecords, scopedTasks])

  const riskSegments = [
    { label: 'Active', value: counts.active, color: COLORS.green },
    { label: 'Expiring Soon', value: counts.expiring, color: COLORS.amber },
    { label: 'Overdue', value: counts.overdue, color: COLORS.red },
  ]

  const byType = useMemo(() => {
    const map = {}
    scopedRecords.forEach((r) => {
      const name = complianceTypeName(r.compliance_type_id)
      map[name] = (map[name] || 0) + 1
    })
    return Object.entries(map).map(([label, value]) => ({ label, value, color: 'var(--text)' }))
  }, [scopedRecords, complianceTypeName])

  const upcoming = useMemo(
    () => [...scopedRecords]
      .filter((r) => r.status !== 'Active')
      .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date))
      .slice(0, 6),
    [scopedRecords]
  )

  return (
    <>
      <Topbar eyebrow="Compliance360 · Overview" title="Dashboard" />
      <div className="content">
        <p className="section-intro">
          One register for every license, renewal, and filing across your portfolio of clients.
        </p>

        {loading ? (
          <div className="empty-state"><Loading message="Loading your register…" /></div>
        ) : (
          <>
            <div className="stat-grid">
              <StatCard label="Total Licenses" value={counts.total} />
              <StatCard label="Expiring Soon" value={counts.expiring} accent="amber" />
              <StatCard label="Overdue" value={counts.overdue} accent="red" />
              <StatCard label="Open Tasks" value={counts.openTasks} />
              <StatCard label="Compliance Score" value={`${counts.score}`} accent={counts.score > 80 ? 'green' : counts.score > 50 ? 'amber' : 'red'} />
            </div>

            <div className="grid-2">
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Renewals Requiring Attention</div>
                </div>
                <div className="panel-body">
                  {upcoming.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-title">Everything is filed.</div>
                      No renewals need attention right now.
                    </div>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Company</th>
                          <th>Compliance</th>
                          <th>Expires</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcoming.map((r) => (
                          <tr key={r.id}>
                            <td>{companyName(r.company_id)}</td>
                            <td>{complianceTypeName(r.compliance_type_id)}</td>
                            <td className="mono">{formatDate(r.expiry_date)}</td>
                            <td><StatusPill status={r.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Risk Distribution</div>
                </div>
                <div className="panel-body">
                  <Donut segments={riskSegments} />
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Licenses by Compliance Type</div>
              </div>
              <div className="panel-body">
                {byType.length === 0 ? (
                  <div className="empty-state">No compliance records yet.</div>
                ) : (
                  <BarList items={byType} />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
