const STATUS_MAP = {
  'Active': { cls: 'status-active', label: 'ACTIVE · VALID' },
  'Expiring Soon': { cls: 'status-expiring', label: 'RENEW · SOON' },
  'Overdue': { cls: 'status-overdue', label: 'OVERDUE' },
}

export default function StampBadge({ status, size = 74 }) {
  const conf = STATUS_MAP[status] || STATUS_MAP['Active']
  return (
    <div
      className={`stamp ${conf.cls}`}
      style={{ width: size, height: size }}
      title={status}
    >
      <span className="stamp-label">{conf.label}</span>
    </div>
  )
}

export function StatusPill({ status }) {
  const map = {
    'Active': 'status-active',
    'Expiring Soon': 'status-expiring',
    'Overdue': 'status-overdue',
    'Open': 'status-open',
    'In Progress': 'status-progress',
    'Completed': 'status-completed',
  }
  return <span className={`pill ${map[status] || 'status-open'}`}>{status}</span>
}
