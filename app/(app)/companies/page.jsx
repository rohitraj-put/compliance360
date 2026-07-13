'use client'

import { useState } from 'react'
import Topbar from '@/components/Topbar'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useAppData } from '@/context/DataContext'
import { IconPlus } from '@/components/Icons'

const BLANK = { id: '', company_name: '', gst_number: '', industry: '', state: '', employee_count: '' }

export default function Companies() {
  const { data, scopedRecords, addOrUpdateCompany, deleteCompany, loading } = useAppData()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const openCreate = () => { setForm(BLANK); setError(''); setModalOpen(true) }
  const openEdit = (company) => { setForm(company); setError(''); setModalOpen(true) }

  const licenseCount = (companyId) => scopedRecords.filter((r) => r.company_id === companyId).length

  const save = async () => {
    if (!form.company_name.trim()) return
    setSaving(true)
    setError('')
    try {
      await addOrUpdateCompany({ ...form, employee_count: Number(form.employee_count) || 0 })
      setModalOpen(false)
    } catch (err) {
      setError(err.message || 'Could not save this company.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    try {
      await deleteCompany(pendingDelete.id)
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <>
      <Topbar
        eyebrow="Client Register"
        title="Companies"
        actions={
          <button className="btn btn-primary" onClick={openCreate}>
            <IconPlus /> Add Company
          </button>
        }
      />
      <div className="content">
        <p className="section-intro">Every client entity your firm manages, with its filing footprint at a glance.</p>

        {loading ? (
          <div className="empty-state">Loading companies…</div>
        ) : data.companies.length === 0 ? (
          <div className="panel"><div className="empty-state">
            <div className="empty-state-title">No companies yet.</div>
            Add your first client to start tracking their compliance.
          </div></div>
        ) : (
          <div className="panel">
            <div className="panel-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>GSTIN</th>
                    <th>Industry</th>
                    <th>State</th>
                    <th>Employees</th>
                    <th>Licenses</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.companies.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.company_name}</strong></td>
                      <td className="mono">{c.gst_number}</td>
                      <td>{c.industry}</td>
                      <td>{c.state}</td>
                      <td>{c.employee_count}</td>
                      <td>{licenseCount(c.id)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-ghost" onClick={() => openEdit(c)}>Edit</button>
                        <button className="btn-ghost" onClick={() => setPendingDelete(c)}>Remove</button>
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
          title={form.id ? 'Edit Company' : 'Add Company'}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save Company'}
              </button>
            </>
          }
        >
          <div className="field">
            <label>Company name</label>
            <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="e.g. Sanskriti Textiles Pvt Ltd" />
          </div>
          <div className="field">
            <label>GSTIN</label>
            <input value={form.gst_number || ''} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} placeholder="09AACS1234C1Z5" />
          </div>
          <div className="field">
            <label>Industry</label>
            <input value={form.industry || ''} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Manufacturing" />
          </div>
          <div className="field">
            <label>State</label>
            <input value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="Uttar Pradesh" />
          </div>
          <div className="field">
            <label>Employee count</label>
            <input type="number" value={form.employee_count ?? ''} onChange={(e) => setForm({ ...form, employee_count: e.target.value })} />
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: 13, margin: 0 }}>{error}</p>}
        </Modal>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove company?"
        message={pendingDelete ? `This removes "${pendingDelete.company_name}" along with all of its compliance records and tasks. This cannot be undone.` : ''}
        confirmLabel="Remove Company"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  )
}
