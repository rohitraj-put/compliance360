'use client'

import { useRef, useState } from 'react'
import Modal from './Modal'
import Avatar from './Avatar'
import { useAuth } from '@/context/AuthContext'

export default function EditProfileModal({ onClose }) {
  const { currentUser, updateProfile } = useAuth()
  const [name, setName] = useState(currentUser?.name || '')
  const [company, setCompany] = useState(currentUser?.company || '')
  const [email, setEmail] = useState(currentUser?.email || '')
  const [photoPreview, setPhotoPreview] = useState(currentUser?.photo || null)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoRemoved, setPhotoRemoved] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file for your profile photo.')
      return
    }
    setPhotoFile(file)
    setPhotoRemoved(false)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setPhotoRemoved(true)
  }

  const save = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Name and email cannot be empty.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const formData = new FormData()
      formData.set('name', name.trim())
      formData.set('company', company.trim())
      formData.set('email', email.trim())
      if (photoFile) formData.set('photo', photoFile)
      if (photoRemoved) formData.set('removePhoto', 'true')
      await updateProfile(formData)
      onClose()
    } catch (err) {
      setError(err.message || 'Could not save your profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title="Edit Profile"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <Avatar name={name} photo={photoPreview} size={64} />
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhoto}
          />
          <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
            Upload Photo
          </button>
          {photoPreview && (
            <button className="btn-ghost" style={{ marginLeft: 8 }} onClick={removePhoto}>
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="field">
        <label>Full name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field">
        <label>Company</label>
        <input value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>
      <div className="field">
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {error && <p style={{ color: 'var(--red)', fontSize: 13, margin: 0 }}>{error}</p>}
    </Modal>
  )
}
