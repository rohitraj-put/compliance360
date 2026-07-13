'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import EditProfileModal from '@/components/EditProfileModal'
import Avatar from '@/components/Avatar'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { PLANS } from '@/lib/plans'
import { IconSun, IconMoon } from '@/components/Icons'

export default function Settings() {
  const { currentUser, changePassword } = useAuth()
  const { theme, setTheme } = useTheme()
  const [editOpen, setEditOpen] = useState(false)

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  const submitPasswordChange = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (pwForm.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New password and confirmation do not match.')
      return
    }
    setPwSaving(true)
    try {
      await changePassword(pwForm.currentPassword, pwForm.newPassword)
      setPwSuccess('Password updated.')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPwError(err.message || 'Could not change your password.')
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <>
      <Topbar eyebrow="Firm Profile" title="Settings" />
      <div className="content">
        <div className="panel">
          <div className="panel-header"><div className="panel-title">Your Profile</div></div>
          <div className="panel-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Avatar name={currentUser?.name} photo={currentUser?.photo} size={56} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{currentUser?.name}</div>
                <div className="mono" style={{ fontSize: 12.5 }}>{currentUser?.email}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                  {currentUser?.company} · {currentUser?.role}
                </div>
              </div>
            </div>
            <button className="btn btn-outline" onClick={() => setEditOpen(true)}>Edit Profile</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><div className="panel-title">Appearance</div></div>
          <div className="panel-body" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className={theme === 'light' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setTheme('light')}>
              <IconSun width={15} height={15} /> Light
            </button>
            <button className={theme === 'dark' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setTheme('dark')}>
              <IconMoon width={15} height={15} /> Dark
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><div className="panel-title">Change Password</div></div>
          <div className="panel-body">
            <form onSubmit={submitPasswordChange} style={{ maxWidth: 380 }}>
              <div className="field">
                <label>Current password</label>
                <input
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                />
              </div>
              <div className="field">
                <label>New password</label>
                <input
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Confirm new password</label>
                <input
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                />
              </div>
              {pwError && <p style={{ color: 'var(--red)', fontSize: 13 }}>{pwError}</p>}
              {pwSuccess && <p style={{ color: 'var(--green)', fontSize: 13 }}>{pwSuccess}</p>}
              <button type="submit" className="btn btn-primary" disabled={pwSaving}>
                {pwSaving ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><div className="panel-title">Your Plan</div></div>
          <div className="panel-body">
            <div className="plan-grid">
              {PLANS.map((p) => (
                <div className={`plan-card ${p.id === 'professional' ? 'featured' : ''}`} key={p.id}>
                  <span className="badge-plan">{p.name.toUpperCase()}</span>
                  <div className="plan-price">₹{p.price.toLocaleString('en-IN')}<span> /month</span></div>
                  <ul className="plan-list">
                    <li>{p.companies}</li>
                    <li>{p.users}</li>
                    <li>Document Vault included</li>
                    <li>Renewal alerts (90/60/30/7 day)</li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}
    </>
  )
}
