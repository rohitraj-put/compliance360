'use client'

import { useAppData } from '@/context/DataContext'
import { useTheme } from '@/context/ThemeContext'
import { IconSun, IconMoon } from './Icons'

export default function Topbar({ eyebrow, title, actions }) {
  const { data, currentCompanyId, setCurrentCompanyId } = useAppData()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="topbar">
      <div>
        {eyebrow && <div className="topbar-eyebrow">{eyebrow}</div>}
        <div className="topbar-title">{title}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <select
          className="company-select"
          value={currentCompanyId}
          onChange={(e) => setCurrentCompanyId(e.target.value)}
        >
          <option value="all">All Clients</option>
          {data.companies.map((c) => (
            <option key={c.id} value={c.id}>{c.company_name}</option>
          ))}
        </select>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          aria-label="Toggle light or dark theme"
        >
          {theme === 'light' ? <IconMoon /> : <IconSun />}
        </button>
        {actions}
      </div>
    </header>
  )
}
