'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/apiClient'
import { useAuth } from './AuthContext'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [companies, setCompanies] = useState([])
  const [complianceTypes, setComplianceTypes] = useState([])
  const [records, setRecords] = useState([])
  const [tasks, setTasks] = useState([])
  const [currentCompanyId, setCurrentCompanyId] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [companiesRes, typesRes, recordsRes, tasksRes] = await Promise.all([
        apiGet('/api/companies'),
        apiGet('/api/compliance/types'),
        apiGet('/api/compliance/records'),
        apiGet('/api/tasks'),
      ])
      setCompanies(companiesRes.companies)
      setComplianceTypes(typesRes.complianceTypes)
      setRecords(recordsRes.records)
      setTasks(tasksRes.tasks)
    } catch (err) {
      setError(err.message || 'Could not load your data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) refetchAll()
  }, [isAuthenticated, refetchAll])

  const scopedRecords = useMemo(
    () => (currentCompanyId === 'all' ? records : records.filter((r) => r.company_id === currentCompanyId)),
    [records, currentCompanyId]
  )
  const scopedTasks = useMemo(
    () => (currentCompanyId === 'all' ? tasks : tasks.filter((t) => t.company_id === currentCompanyId)),
    [tasks, currentCompanyId]
  )

  const companyName = useCallback(
    (id) => companies.find((c) => c.id === id)?.company_name || 'Unknown',
    [companies]
  )
  const complianceTypeName = useCallback(
    (id) => complianceTypes.find((t) => t.id === id)?.name || id,
    [complianceTypes]
  )

  // ---- companies ----
  const addOrUpdateCompany = async (company) => {
    if (company.id) {
      await apiPut(`/api/companies/${company.id}`, company)
    } else {
      await apiPost('/api/companies', company)
    }
    await refetchAll()
  }
  const deleteCompany = async (id) => {
    await apiDelete(`/api/companies/${id}`)
    if (currentCompanyId === id) setCurrentCompanyId('all')
    await refetchAll()
  }

  // ---- compliance records ----
  const addOrUpdateRecord = async (record) => {
    if (record.id) {
      await apiPut(`/api/compliance/records/${record.id}`, record)
    } else {
      await apiPost('/api/compliance/records', record)
    }
    await refetchAll()
  }
  const deleteRecord = async (id) => {
    await apiDelete(`/api/compliance/records/${id}`)
    await refetchAll()
  }

  // ---- tasks ----
  const addOrUpdateTask = async (task) => {
    if (task.id) {
      await apiPut(`/api/tasks/${task.id}`, task)
    } else {
      await apiPost('/api/tasks', task)
    }
    await refetchAll()
  }
  const deleteTask = async (id) => {
    await apiDelete(`/api/tasks/${id}`)
    await refetchAll()
  }
  const setTaskStatus = async (id, status) => {
    await apiPatch(`/api/tasks/${id}/status`, { status })
    await refetchAll()
  }

  const value = {
    companies,
    complianceTypes,
    records,
    tasks,
    scopedRecords,
    scopedTasks,
    currentCompanyId,
    setCurrentCompanyId,
    companyName,
    complianceTypeName,
    loading,
    error,
    refetchAll,
    addOrUpdateCompany,
    deleteCompany,
    addOrUpdateRecord,
    deleteRecord,
    addOrUpdateTask,
    deleteTask,
    setTaskStatus,
    // kept as `data.*` for compatibility with ported page components
    data: { companies, complianceTypes, records, tasks },
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useAppData must be used within DataProvider')
  return ctx
}
