const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const IconDashboard = (p) => (
  <svg viewBox="0 0 24 24" className="nav-icon" {...base} {...p}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="5" rx="1.5" />
    <rect x="13" y="11" width="8" height="10" rx="1.5" />
    <rect x="3" y="14" width="8" height="7" rx="1.5" />
  </svg>
)

export const IconBuilding = (p) => (
  <svg viewBox="0 0 24 24" className="nav-icon" {...base} {...p}>
    <rect x="4" y="3" width="12" height="18" rx="1" />
    <path d="M9 7h2M9 11h2M9 15h2" />
    <path d="M16 9h4v12h-4" />
  </svg>
)

export const IconShield = (p) => (
  <svg viewBox="0 0 24 24" className="nav-icon" {...base} {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

export const IconCalendar = (p) => (
  <svg viewBox="0 0 24 24" className="nav-icon" {...base} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
)

export const IconFolder = (p) => (
  <svg viewBox="0 0 24 24" className="nav-icon" {...base} {...p}>
    <path d="M3 7a1 1 0 011-1h5l2 2h9a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V7z" />
  </svg>
)

export const IconTasks = (p) => (
  <svg viewBox="0 0 24 24" className="nav-icon" {...base} {...p}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" />
  </svg>
)

export const IconUsers = (p) => (
  <svg viewBox="0 0 24 24" className="nav-icon" {...base} {...p}>
    <circle cx="8" cy="8" r="3" />
    <path d="M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="17" cy="8" r="2.5" />
    <path d="M15.5 14.2c2.6.5 4.5 2.8 4.5 5.8" />
  </svg>
)

export const IconSettings = (p) => (
  <svg viewBox="0 0 24 24" className="nav-icon" {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 00-2-1.2L14 3h-4l-.6 2.6a7 7 0 00-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9c.6.5 1.3.9 2 1.2L10 21h4l.6-2.6c.7-.3 1.4-.7 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" />
  </svg>
)

export const IconPlus = (p) => (
  <svg viewBox="0 0 24 24" width="14" height="14" {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconFile = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...p}>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4" />
  </svg>
)

export const IconClose = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const IconLogout = (p) => (
  <svg viewBox="0 0 24 24" width="15" height="15" {...base} {...p}>
    <path d="M9 21H5a1 1 0 01-1-1V4a1 1 0 011-1h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
)

export const IconSun = (p) => (
  <svg viewBox="0 0 24 24" width="17" height="17" {...base} {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.4M12 19.1v2.4M4.5 12H2M22 12h-2.5M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7" />
  </svg>
)

export const IconMoon = (p) => (
  <svg viewBox="0 0 24 24" width="17" height="17" {...base} {...p}>
    <path d="M20 14.5A8.5 8.5 0 1110.2 4a7 7 0 009.8 10.5z" />
  </svg>
)
