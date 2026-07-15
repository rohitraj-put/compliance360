'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import Topbar from '@/components/Topbar'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useAppData } from '@/context/DataContext'
import { apiGet, apiPost, apiDelete } from '@/lib/apiClient'
import { formatDate } from '@/lib/date'
import { IconFile, IconPlus } from '@/components/Icons'
import { FaEdit, FaEye, FaDownload } from "react-icons/fa";
import Loading from '@/components/Loading'

export default function Documents() {
  const { scopedRecords, companyName, complianceTypeName, loading } = useAppData()
  const [activeRecordId, setActiveRecordId] = useState('')
  const [documents, setDocuments] = useState([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const fileInputRef = useRef(null)

  const recordId = scopedRecords.some((r) => r.id === activeRecordId) ? activeRecordId : scopedRecords[0]?.id

  const folders = useMemo(() => {
    const map = {}
    scopedRecords.forEach((r) => {
      const key = companyName(r.company_id)
      map[key] = map[key] || []
      map[key].push(r)
    })
    return map
  }, [scopedRecords, companyName])

  const loadDocuments = useCallback(async () => {
    if (!recordId) { setDocuments([]); return }
    setDocsLoading(true)
    try {
      const res = await apiGet(`/api/documents?compliance_record_id=${recordId}`)
      setDocuments(res.documents)
    } catch {
      setDocuments([])
    } finally {
      setDocsLoading(false)
    }
  }, [recordId])

  useEffect(() => { loadDocuments() }, [loadDocuments])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !recordId) return
    setUploading(true)
    setUploadError('')
    try {
      const formData = new FormData()
      formData.set('compliance_record_id', recordId)
      formData.set('file', file)
      await apiPost('/api/documents', formData)
      await loadDocuments()
    } catch (err) {
      setUploadError(err.message || 'Could not upload that file.')
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = (filePath, fileName) => {
    const link = document.createElement('a')
    link.href = filePath
    link.download = fileName || ''
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const confirmDelete = async () => {
    try {
      await apiDelete(`/api/documents/${pendingDelete.id}`)
      await loadDocuments()
    } finally {
      setPendingDelete(null)
    }
  }

  const activeRecord = scopedRecords.find((r) => r.id === recordId)

  return (
    <>
      <Topbar eyebrow="Document Vault" title="Documents" />
      <div className="content">
        <p className="section-intro">Organised by client, then by compliance type — every certificate, filed and versioned.</p>
        <div className="grid-2">
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Folders</div></div>
            <div className="panel-body folder-tree">
              {loading ? (
                <div className="empty-state"><Loading message="Loading folders…" /></div>
              ) : Object.entries(folders).length === 0 ? (
                <div className="empty-state">No compliance records in scope.</div>
              ) : (
                Object.entries(folders).map(([company, records]) => (
                  <div key={company} style={{ marginBottom: 10 }}>
                    <div style={{ color: 'var(--text)', fontWeight: 600 }}>▸ {company}</div>
                    {records.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => setActiveRecordId(r.id)}
                        style={{
                          cursor: 'pointer',
                          paddingLeft: 18,
                          color: r.id === recordId ? 'var(--saffron-dark)' : 'var(--text-muted)',
                          fontWeight: r.id === recordId ? 600 : 400,
                        }}
                      >
                        ├ {complianceTypeName(r.compliance_type_id)}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                {activeRecord ? `${complianceTypeName(activeRecord.compliance_type_id)} — ${companyName(activeRecord.company_id)}` : 'Select a folder'}
              </div>
              {activeRecord && (
                <>
                  <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleUpload} />
                  <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <IconPlus /> {uploading ? 'Uploading…' : 'Upload'}
                  </button>
                </>
              )}
            </div>
            <div className="panel-body">
              {uploadError && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 0 }}>{uploadError}</p>}
              {!activeRecord ? (
                <div className="empty-state">Pick a compliance folder on the left to view its documents.</div>
              ) : docsLoading ? (
                <div className="empty-state">Loading documents…</div>
              ) : documents.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-title">No documents filed yet.</div>
                  Upload the certificate or renewal form for this record. PDF, DOC, DOCX, JPG, PNG, or WEBP, up to 10MB.
                </div>
              ) : (
                documents.map((d) => (
                  <div className="doc-row" key={d.id}>
                    <div className="doc-icon"><IconFile /></div>
                    <div style={{ flex: 1 }}>
                      <a href={d.file_path} target="_blank" rel="noreferrer" style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)', textDecoration: 'none' }}>
                        {d.file_name}
                      </a>
                      <div className="mono" style={{ fontSize: 10 }}>
                        v{d.version} · {d.size_kb} KB · uploaded {formatDate(d.uploaded_on)}
                      </div>
                    </div>
                    <div className="doc-actions" style={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <button className="btn-ghost btn-ghost-view" onClick={() => window.open(d.file_path, '_blank')}>
                        <FaEye />
                      </button>
                      <button className="btn-ghost btn-ghost-download" onClick={() => handleDownload(d.file_path, d.file_name)}>
                        <FaDownload />
                      </button>
                      <button className="btn-ghost btn-ghost-edit" onClick={() => setPendingDelete(d)}>
                        <FaEdit />
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove document?"
        message={pendingDelete ? `This removes "${pendingDelete.file_name}" from the vault. This cannot be undone.` : ''}
        confirmLabel="Remove Document"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  )
}
