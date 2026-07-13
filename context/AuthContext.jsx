'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiGet, apiPost, apiPut } from '@/lib/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    try {
      const data = await apiGet('/api/auth/me')
      setCurrentUser(data.user)
    } catch {
      setCurrentUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  const register = async ({ name, company, email, password }) => {
    try {
      const data = await apiPost('/api/auth/register', { name, company, email, password })
      setCurrentUser(data.user)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }

  const login = async ({ email, password }) => {
    try {
      const data = await apiPost('/api/auth/login', { email, password })
      setCurrentUser(data.user)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }

  const logout = async () => {
    try {
      await apiPost('/api/auth/logout')
    } finally {
      setCurrentUser(null)
    }
  }

  const updateProfile = async (formData) => {
    const data = await apiPut('/api/auth/me', formData)
    setCurrentUser(data.user)
    return data.user
  }

  const changePassword = async (currentPassword, newPassword) => {
    await apiPut('/api/auth/me/password', { currentPassword, newPassword })
  }

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    refreshMe,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
