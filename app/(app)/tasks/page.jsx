'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useAppData } from '@/context/DataContext'
import { formatDate } from '@/lib/date'
import { IconPlus } from '@/components/Icons'
import { FaTrash } from "react-icons/fa";
import Loading from '@/components/Loading'

const COLUMNS = ['Open', 'In Progress', 'Completed']
const BLANK = { id: '', title: '', company_id: '', assigned_to: 'Consultant', due_date: '', status: 'Open' }

export default function Tasks() {
  const {
    data, scopedTasks, currentCompanyId, companyName,
    addOrUpdateTask, deleteTask, setTaskStatus, loading,
  } = useAppData()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setForm({ ...BLANK, company_id: currentCompanyId !== 'all' ? currentCompanyId : data.companies[0]?.id || '' })
    setError('')
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.title.trim() || !form.company_id) return
    setSaving(true)
    setError('')
    try {
      await addOrUpdateTask(form)
      setModalOpen(false)
    } catch (err) {
      setError(err.message || 'Could not save this task.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    try {
      await deleteTask(pendingDelete.id)
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <>
      <Topbar
        eyebrow="Task Management"
        title="Tasks"
        actions={
          <button className="btn btn-primary" onClick={openCreate} disabled={data.companies.length === 0}>
            <IconPlus /> New Task
          </button>
        }
      />
      <div className="content">
        <p className="section-intro">Move a task across the board as filings progress from open to complete.</p>

        {loading ? (
          <div className="empty-state"><Loading message="Loading tasks…"/></div>
        ) : (
          <div className="kanban">
            {COLUMNS.map((col) => {
              const items = scopedTasks.filter((t) => t.status === col)
              return (
                <div className="kanban-col" key={col}>
                  <div className="kanban-col-title"><span>{col}</span><span>{items.length}</span></div>
                  {items.map((t) => (
                    <div className="task-card" key={t.id}>
                      <div className="task-title">{t.title}</div>
                      <div className="task-meta">
                        <span>{companyName(t.company_id)} · {t.assigned_to}</span>
                        <span className="mono">{formatDate(t.due_date)}</span>
                      </div>
                      <div className="task-actions">
                        {COLUMNS.filter((c) => c !== col).map((c) => (
                          <button key={c} className="btn btn-outline" onClick={() => setTaskStatus(t.id, c)}>
                            Move to {c}
                          </button>
                        ))}
                        <button className="btn-ghost btn-ghost-delete" onClick={() => setPendingDelete(t)}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <div style={{ fontSize: 12.5, color: 'var(--text-muted)', padding: '8px 4px' }}>Nothing here.</div>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal
          title="New Task"
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Create Task'}
              </button>
            </>
          }
        >
          <div className="field">
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Renew Factory License" />
          </div>
          <div className="field">
            <label>Company</label>
            <select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })}>
              <option value="">Select company</option>
              {data.companies.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Assign to</label>
            <select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
              <option>Consultant</option>
              <option>HR</option>
              <option>Admin</option>
            </select>
          </div>
          <div className="field">
            <label>Due date</label>
            <input type="date" value={form.due_date || ''} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: 13, margin: 0 }}>{error}</p>}
        </Modal>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete task?"
        message={pendingDelete ? `This deletes "${pendingDelete.title}". This cannot be undone.` : ''}
        confirmLabel="Delete Task"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  )
}
