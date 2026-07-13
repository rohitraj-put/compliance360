export function daysUntil(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function deriveStatus(expiryDate) {
  const d = daysUntil(expiryDate)
  if (d < 0) return 'Overdue'
  if (d <= 30) return 'Expiring Soon'
  return 'Active'
}
