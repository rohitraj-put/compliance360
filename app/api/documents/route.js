import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { pool } from '@/lib/db'
import { ApiError } from '@/lib/ApiError'
import { withErrorHandling, getUser } from '@/lib/apiHelpers'
import { getOwnedRecordOrFail } from '@/lib/ownership'
import { saveUploadedFile } from '@/lib/uploads'

export const dynamic = 'force-dynamic'

export const GET = withErrorHandling(async (request) => {
  const user = getUser(request)
  const { searchParams } = new URL(request.url)
  const recordId = searchParams.get('compliance_record_id')
  if (!recordId) throw ApiError.badRequest('compliance_record_id query param is required.')

  await getOwnedRecordOrFail(recordId, user.id)

  const [rows] = await pool.query(
    'SELECT * FROM documents WHERE compliance_record_id = ? ORDER BY version ASC',
    [recordId]
  )
  return NextResponse.json({ documents: rows })
})

export const POST = withErrorHandling(async (request) => {
  const user = getUser(request)
  const form = await request.formData()
  const recordId = form.get('compliance_record_id')
  const file = form.get('file')

  if (!recordId) throw ApiError.badRequest('compliance_record_id is required.')
  await getOwnedRecordOrFail(recordId, user.id)

  const saved = await saveUploadedFile(file)

  const [existing] = await pool.query(
    'SELECT COUNT(*) AS count FROM documents WHERE compliance_record_id = ?',
    [recordId]
  )
  const version = existing[0].count + 1
  const id = uuidv4()

  await pool.query(
    `INSERT INTO documents (id, compliance_record_id, file_name, file_path, mime_type, version, size_kb, uploaded_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, recordId, saved.originalName, saved.urlPath, saved.mimeType, version, saved.sizeKb, user.id]
  )

  const [rows] = await pool.query('SELECT * FROM documents WHERE id = ?', [id])
  return NextResponse.json({ document: rows[0] }, { status: 201 })
})
