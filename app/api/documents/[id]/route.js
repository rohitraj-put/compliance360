import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ApiError } from '@/lib/ApiError'
import { withErrorHandling, getUser } from '@/lib/apiHelpers'
import { deleteUploadedFile } from '@/lib/uploads'

export const dynamic = 'force-dynamic'

export const DELETE = withErrorHandling(async (request, { params }) => {
  const user = getUser(request)
  const [rows] = await pool.query(
    `SELECT d.* FROM documents d
     JOIN compliance_records r ON r.id = d.compliance_record_id
     JOIN companies c ON c.id = r.company_id
     WHERE d.id = ? AND c.owner_user_id = ?`,
    [params.id, user.id]
  )
  if (rows.length === 0) throw ApiError.notFound('Document not found.')

  await pool.query('DELETE FROM documents WHERE id = ?', [rows[0].id])
  deleteUploadedFile(rows[0].file_path)

  return new NextResponse(null, { status: 204 })
})
