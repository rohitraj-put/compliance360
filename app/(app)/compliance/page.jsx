'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import StampBadge, { StatusPill } from '@/components/StampBadge'
import { useAppData } from '@/context/DataContext'
import { formatDate } from '@/lib/date'
import { IconPlus } from '@/components/Icons'
import { FaEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import Loading from '@/components/Loading'

const BLANK = { id: '', company_id: '', compliance_type_id: '', issue_date: '', expiry_date: '', notes: '' }

export default function Compliance() {
  const {
    data, scopedRecords, currentCompanyId, companyName, complianceTypeName,
    addOrUpdateRecord, deleteRecord, loading,
  } = useAppData()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [statusFilter, setStatusFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setForm({ ...BLANK, company_id: currentCompanyId !== 'all' ? currentCompanyId : data.companies[0]?.id || '' })
    setError('')
    setModalOpen(true)
  }
  const openEdit = (record) => { setForm(record); setError(''); setModalOpen(true) }

  const save = async () => {
    if (!form.company_id || !form.compliance_type_id || !form.expiry_date) return
    setSaving(true)
    setError('')
    try {
      await addOrUpdateRecord(form)
      setModalOpen(false)
    } catch (err) {
      setError(err.message || 'Could not save this record.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    try {
      await deleteRecord(pendingDelete.id)
    } finally {
      setPendingDelete(null)
    }
  }

  const filtered = statusFilter === 'all' ? scopedRecords : scopedRecords.filter((r) => r.status === statusFilter)

  return (
    <>
      <Topbar
        eyebrow="Filing Register"
        title="Compliance Tracker"
        actions={
          <button className="btn btn-primary" onClick={openCreate} disabled={data.companies.length === 0}>
            <IconPlus /> Add Compliance
          </button>
        }
      />
      <div className="content">
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {['all', 'Active', 'Expiring Soon', 'Overdue'].map((s) => (
            <button
              key={s}
              className={statusFilter === s ? 'btn btn-primary' : 'btn btn-outline'}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty-state"><Loading message="Loading records…" /></div>
        ) : data.companies.length === 0 ? (
          <div className="panel"><div className="empty-state">
            <div className="empty-state-title">Add a company first.</div>
            Compliance records are filed under a client company.
          </div></div>
        ) : filtered.length === 0 ? (
          <div className="panel"><div className="empty-state">
            <div className="empty-state-title">No records here.</div>
            Try a different filter, or file a new compliance record.
          </div></div>
        ) : (
          <div className="panel">
            <div className="panel-body" style={{ padding: 0,textTransform: 'capitalize' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Company</th>
                    <th>Compliance Type</th>
                    <th>Issued</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td><StampBadge status={r.status} size={54} /></td>
                      <td><strong>{companyName(r.company_id)}</strong></td>
                      <td>{complianceTypeName(r.compliance_type_id)}</td>
                      <td className="mono">{formatDate(r.issue_date)}</td>
                      <td className="mono">{formatDate(r.expiry_date)}</td>
                      <td><StatusPill status={r.status} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-ghost btn-ghost-edit" onClick={() => openEdit(r)}>
                          <FaEdit />
                        </button>
                        <button className="btn-ghost btn-ghost-delete" onClick={() => setPendingDelete(r)}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal
          title={form.id ? 'Edit Compliance Record' : 'Add Compliance Record'}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save Record'}
              </button>
            </>
          }
        >
          <div className="field">
            <label>Company</label>
            <select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })}>
              <option value="">Select company</option>
              {data.companies.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Compliance type</label>
            <select value={form.compliance_type_id} onChange={(e) => setForm({ ...form, compliance_type_id: e.target.value })}>
              <option value="">Select type</option>
              {data.complianceTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Issue date</label>
            <input type="date" value={form.issue_date || ''} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} />
          </div>
          <div className="field">
            <label>Expiry date</label>
            <input type="date" value={form.expiry_date || ''} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anything the next reviewer should know" />
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: 13, margin: 0 }}>{error}</p>}
        </Modal>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete compliance record?"
        message={pendingDelete ? `This deletes the ${complianceTypeName(pendingDelete.compliance_type_id)} record for ${companyName(pendingDelete.company_id)}, along with any documents filed under it. This cannot be undone.` : ''}
        confirmLabel="Delete Record"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  )
}
