'use client'

import { useMemo } from 'react'
import Topbar from '@/components/Topbar'
import { useAppData } from '@/context/DataContext'
import { formatDate, daysUntil } from '@/lib/date'
import { StatusPill } from '@/components/StampBadge'

function barColor(days) {
  if (days < 0) return '#C1443C'
  if (days <= 30) return '#E8963C'
  if (days <= 90) return '#D9A441'
  return '#3F7D58'
}

export default function CalendarPage() {
  const { scopedRecords, companyName, complianceTypeName, loading } = useAppData()

  const sorted = useMemo(
    () => [...scopedRecords].sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date)),
    [scopedRecords]
  )

  const maxHorizon = 365

  return (
    <>
      <Topbar eyebrow="Alerts at 90 · 60 · 30 · 7 days" title="Renewal Calendar" />
      <div className="content">
        <p className="section-intro">
          Every filing due, ordered by urgency. Bars shorten as the deadline approaches.
        </p>
        <div className="panel">
          <div className="panel-body">
            {loading ? (
              <div className="empty-state">Loading renewals…</div>
            ) : sorted.length === 0 ? (
              <div className="empty-state">No renewals scheduled.</div>
            ) : (
              <div className="calendar-list">
                {sorted.map((r) => {
                  const days = daysUntil(r.expiry_date)
                  const pct = Math.max(3, Math.min(100, 100 - (days / maxHorizon) * 100))
                  return (
                    <div className="calendar-row" key={r.id}>
                      <div className="calendar-date">{formatDate(r.expiry_date)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>
                          {complianceTypeName(r.compliance_type_id)} — {companyName(r.company_id)}
                        </div>
                        <div className="calendar-bar">
                          <div
                            className="calendar-bar-fill"
                            style={{ width: `${pct}%`, background: barColor(days) }}
                          />
                        </div>
                      </div>
                      <div style={{ width: 90, textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                      </div>
                      <StatusPill status={r.status} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
