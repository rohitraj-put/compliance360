'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  IconDashboard, IconBuilding, IconShield, IconCalendar,
  IconFolder, IconTasks, IconUsers, IconSettings, IconLogout,
} from './Icons'
import Avatar from './Avatar'
import EditProfileModal from './EditProfileModal'
import ConfirmDialog from './ConfirmDialog'
import { useAuth } from '@/context/AuthContext'
import { FaCode } from "react-icons/fa6";

const NAV = [
  { to: '/', label: 'Dashboard', icon: IconDashboard, end: true },
  { to: '/companies', label: 'Companies', icon: IconBuilding },
  { to: '/compliance', label: 'Compliance Tracker', icon: IconShield },
  { to: '/calendar', label: 'Renewal Calendar', icon: IconCalendar },
  { to: '/documents', label: 'Document Vault', icon: IconFolder },
  { to: '/tasks', label: 'Tasks', icon: IconTasks },
  { to: '/consultant', label: 'Consultant Portal', icon: IconUsers },
  { to: '/settings', label: 'Settings', icon: IconSettings },
]

export default function Sidebar() {
  const { currentUser, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  const isActive = (to, end) => (end ? pathname === to : pathname.startsWith(to))

  const handleLogout = async () => {
    setLogoutConfirmOpen(false)
    await logout()
    router.push('/login')
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">C3</div>
        <div>
          <div className="brand-text">Compliance360</div>
          <div className="brand-sub">Regulatory Register</div>
        </div>
      </div>
      <ul className="nav-list">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <li className="nav-item" key={to}>
            <Link href={to} className={isActive(to, end) ? 'active' : ''}>
              <Icon />
              <span className="label">{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="sidebar-profile">
        <button className="sidebar-profile-trigger" onClick={() => setEditOpen(true)} title="Edit profile">
          <Avatar name={currentUser?.name} photo={currentUser?.photo} size={36} />
          <span className="sidebar-profile-info label">
            <span className="sidebar-profile-name">{currentUser?.name || 'Guest'}</span>
            <span className="sidebar-profile-role">{currentUser?.role || ''}</span>
          </span>
        </button>
        <button className="sidebar-logout" onClick={() => setLogoutConfirmOpen(true)} title="Log out">
          <IconLogout />
          <span className="label">Log Out</span>
        </button>
        <button className="sidebar-logout" title="App Version" disabled>
          <FaCode />
          <span className="label">v {process.env.NEXT_PUBLIC_APP_VERSION || '?.?.?'}</span>
        </button>
        <span className="sidebar-footer">
          <span className="sidebar-footer-text">[Crafted with <span>❤</span> and without lots of ☕ made by </span>
          <a href="https://rohitrajputweb.netlify.app/" target="_blank" rel="noopener noreferrer" className="sidebar-footer-link">
            Rohit Rajput]
          </a>    
        </span>
      </div>

      {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}

      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Log out?"
        message="You'll be returned to the login screen. Any unsaved changes in an open form will be lost."
        confirmLabel="Log Out"
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
      />
    </aside>
  )
}
