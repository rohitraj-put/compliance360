const COLORS = {
  green: '#3F7D58',
  amber: '#E8963C',
  red: '#C1443C',
  navy: '#14213D',
}

export function BarList({ items }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <div>
      {items.map((item) => (
        <div className="bar-row" key={item.label}>
          <div className="bar-label">{item.label}</div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(item.value / max) * 100}%`, background: item.color || COLORS.navy }}
            />
          </div>
          <div className="bar-value">{item.value}</div>
        </div>
      ))}
    </div>
  )
}

export function Donut({ segments, size = 150, strokeWidth = 22 }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  let offsetAccum = 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--tint-track)"
            strokeWidth={strokeWidth}
          />
          {segments.map((s) => {
            const fraction = s.value / total
            const dash = fraction * circumference
            const gap = circumference - dash
            const circle = (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offsetAccum}
                strokeLinecap="butt"
              />
            )
            offsetAccum += dash
            return circle
          })}
        </g>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="Fraunces, serif"
          fontSize="22"
          fontWeight="600"
          fill="var(--text)"
        >
          {total}
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {segments.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-muted)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, display: 'inline-block' }} />
            {s.label} — <strong style={{ color: '#22283A' }}>{s.value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

export { COLORS }
