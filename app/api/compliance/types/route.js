import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { withErrorHandling } from '@/lib/apiHelpers'

export const dynamic = 'force-dynamic'

export const GET = withErrorHandling(async () => {
  const [rows] = await pool.query('SELECT * FROM compliance_types ORDER BY name ASC')
  return NextResponse.json({ complianceTypes: rows })
})
