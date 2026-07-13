import { pool } from './db'
import { ApiError } from './ApiError'

export async function getOwnedCompanyOrFail(companyId, userId) {
  const [rows] = await pool.query('SELECT * FROM companies WHERE id = ? AND owner_user_id = ?', [companyId, userId])
  if (rows.length === 0) throw ApiError.notFound('Company not found.')
  return rows[0]
}

export async function getOwnedRecordOrFail(recordId, userId) {
  const [rows] = await pool.query(
    `SELECT r.* FROM compliance_records r
     JOIN companies c ON c.id = r.company_id
     WHERE r.id = ? AND c.owner_user_id = ?`,
    [recordId, userId]
  )
  if (rows.length === 0) throw ApiError.notFound('Compliance record not found.')
  return rows[0]
}

export async function getOwnedTaskOrFail(taskId, userId) {
  const [rows] = await pool.query(
    `SELECT t.* FROM tasks t
     JOIN companies c ON c.id = t.company_id
     WHERE t.id = ? AND c.owner_user_id = ?`,
    [taskId, userId]
  )
  if (rows.length === 0) throw ApiError.notFound('Task not found.')
  return rows[0]
}
