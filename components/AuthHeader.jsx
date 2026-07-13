'use client'

import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'
import { IconSun, IconMoon } from './Icons'

export default function AuthHeader() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="auth-header">
      <Link href="/login" className="auth-header-brand">
        <span className="stamp-mark" style={{ width: 34, height: 34, fontSize: 12, color: '#E8963C' }}>C3</span>
        <span className="auth-header-brand-text">Compliance360</span>
      </Link>
      <button
        className="auth-theme-toggle"
        onClick={toggleTheme}
        title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        aria-label="Toggle light or dark theme"
      >
        {theme === 'light' ? <IconMoon /> : <IconSun />}
        <span>{theme === 'light' ? 'Dark' : 'Light'} mode</span>
      </button>
    </header>
  )
}
