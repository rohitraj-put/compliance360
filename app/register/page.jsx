'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AuthHeader from '@/components/AuthHeader'

export default function Register() {
  const { register } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', company: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const result = await register(form)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="auth-shell">
      <AuthHeader />
      <div className="auth-main">
      <div className="auth-card">
        <div className="eyebrow">Regulatory Register</div>
        <h1 className="auth-title">Create your register</h1>
        <p className="auth-subtitle">Set up an account to start tracking your clients.</p>

        <form onSubmit={submit}>
          <div className="field">
            <label>Full name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Anita Rao"
              autoFocus
            />
          </div>
          <div className="field">
            <label>Company / firm name</label>
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Sanskriti Textiles Pvt Ltd"
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="anita@sanskritextiles.in"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already registered? <Link href="/login">Log in</Link>
        </p>
      </div>
      </div>
    </div>
  )
}
