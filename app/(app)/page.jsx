'use client'

import { useMemo, useState } from 'react'
import Topbar from '@/components/Topbar'
import StatCard from '@/components/StatCard'
import { useAppData } from '@/context/DataContext'
import { Donut, BarList, COLORS } from '@/components/charts/SimpleCharts'
import { formatDate } from '@/lib/date'
import { StatusPill } from '@/components/StampBadge'
import Loading from '@/components/Loading'

export default function Dashboard() {
  const { scopedRecords, scopedTasks, companyName, complianceTypeName, loading } = useAppData()
  const [dateRange, setDateRange] = useState('all') // all, today, yesterday, weekly, monthly
  const [statusFilters, setStatusFilters] = useState({ Active: true, 'Expiring Soon': true, Overdue: true })
  const [statusSelection, setStatusSelection] = useState('all')

  const updateStatusSelection = (value) => {
    setStatusSelection(value)
    setStatusFilters({
      Active: value === 'all' || value === 'Active',
      'Expiring Soon': value === 'all' || value === 'Expiring Soon',
      Overdue: value === 'all' || value === 'Overdue',
    })
  }

  const inDateRange = (dateStr) => {
    if (!dateStr) return false
    const d = new Date(dateStr)
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    if (dateRange === 'all') return true
    if (dateRange === 'today') return d >= startOfToday && d < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
    if (dateRange === 'yesterday') {
      const y = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000)
      return d >= y && d < startOfToday
    }
    if (dateRange === 'weekly') {
      const weekAgo = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000)
      return d >= weekAgo && d < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
    }
    if (dateRange === 'monthly') {
      const monthAgo = new Date(startOfToday)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return d >= monthAgo && d < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
    }
    return true
  }

  const filteredRecords = useMemo(() => scopedRecords.filter((r) => statusFilters[r.status] && inDateRange(r.expiry_date)), [scopedRecords, statusFilters, dateRange])

  const counts = useMemo(() => {
    const total = filteredRecords.length
    const expiring = filteredRecords.filter((r) => r.status === 'Expiring Soon').length
    const overdue = filteredRecords.filter((r) => r.status === 'Overdue').length
    const active = filteredRecords.filter((r) => r.status === 'Active').length
    const openTasks = scopedTasks.filter((t) => t.status !== 'Completed').length
    const score = total === 0 ? 100 : Math.max(0, Math.round(100 - (overdue * 15 + expiring * 5)))
    return { total, expiring, overdue, active, openTasks, score }
  }, [filteredRecords, scopedTasks])

  const riskSegments = [
    { label: 'Active', value: counts.active, color: COLORS.green },
    { label: 'Expiring Soon', value: counts.expiring, color: COLORS.amber },
    { label: 'Overdue', value: counts.overdue, color: COLORS.red },
  ]

  const byType = useMemo(() => {
    const map = {}
    filteredRecords.forEach((r) => {
      const name = complianceTypeName(r.compliance_type_id)
      map[name] = (map[name] || 0) + 1
    })
    return Object.entries(map).map(([label, value]) => ({ label, value, color: 'var(--text)' }))
  }, [filteredRecords, complianceTypeName])

  const upcoming = useMemo(
    () => [...filteredRecords]
      .filter((r) => r.status !== 'Active')
      .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date))
      .slice(0, 6),
    [filteredRecords]
  )

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return { text: 'Good morning', icon: '☀️' }
    if (hour >= 12 && hour < 17) return { text: 'Good noon', icon: '🌤️' }
    return { text: 'Good evening', icon: '🌙' }
  }, [])

  return (
    <>
      <Topbar eyebrow="Compliance360 · Overview" title="Dashboard" />
      <div className="content">
        <p className="section-intro">
          One register for every license, renewal, and filing across your portfolio of clients.
        </p>

        <div className="top-panels" style={{ display: 'grid', gap: 16 }}>
          <div className="panel" style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1rem' }} className="stat-label">{`${greeting.icon} ${greeting.text}, Team`}</span>

            <div className="panel-body" style={{ padding: 0, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', background: 'transparent' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="stat-label">Filter by Date</span>
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{ marginLeft: 8, padding: '8px 10px', borderRadius: 10, border: '1px solid var(--border-strong)', background: 'var(--background)', color: 'var(--text)' }}>
                  <option value="all">All</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="weekly">Last 7 days</option>
                  <option value="monthly">Last 30 days</option>
                </select>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 10, background: 'var(--background)' }}>
                  <span className="stat-label">Status</span>
                  <select
                    value={statusSelection}
                    onChange={(e) => updateStatusSelection(e.target.value)}
                    style={{ marginLeft: 8, padding: '8px 10px', borderRadius: 10, border: '1px solid var(--border-strong)', background: 'var(--background)', color: 'var(--text)' }}
                  >
                    <option value="all">All</option>
                    <option value="Active">Active</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </label>
              </div>

            </div>
          </div>
        </div>

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
