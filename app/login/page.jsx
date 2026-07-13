'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AuthHeader from '@/components/AuthHeader'

export default function Login() {
  const { login } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const result = await login(form)
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
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your client register.</p>

        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="anita@sanskritextiles.in"
              autoFocus
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} disabled={submitting}>
            {submitting ? 'Signing in…' : 'Log In'}
          </button>
        </form>

        <p className="auth-footer-text">
          New to Compliance360? <Link href="/register">Create an account</Link>
        </p>
        <p className="auth-footer-text" style={{ marginTop: 8 }}>
          Demo login: <strong>demo@Compliance360.app</strong> / <strong>password123</strong>
        </p>
      </div>
      </div>
    </div>
  )
}
