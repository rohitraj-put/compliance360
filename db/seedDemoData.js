import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import 'dotenv/config'

const DEMO_EMAIL = 'demo@Compliance360.app'
const DEMO_PASSWORD = 'password123'

function addDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Compliance360',
  })

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [DEMO_EMAIL])
  if (existing.length > 0) {
    console.log(`Demo user ${DEMO_EMAIL} already exists — skipping seed. Delete the row to reseed.`)
    await pool.end()
    return
  }

  const userId = uuidv4()
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)
  await pool.query(
    `INSERT INTO users (id, name, company, email, password_hash, role) VALUES (?, ?, ?, ?, ?, 'Company Admin')`,
    [userId, 'Anita Rao', 'Agile Regulatory', DEMO_EMAIL, passwordHash]
  )

  const companies = [
    { id: uuidv4(), company_name: 'Sanskriti Textiles Pvt Ltd', gst_number: '09AACS1234C1Z5', industry: 'Manufacturing', state: 'Uttar Pradesh', employee_count: 42 },
    { id: uuidv4(), company_name: 'Bharat Auto Components', gst_number: '27AACB5678D1Z2', industry: 'Manufacturing', state: 'Maharashtra', employee_count: 118 },
    { id: uuidv4(), company_name: 'Nilgiri Foods & Beverages', gst_number: '33AACN4321E1Z9', industry: 'Food Processing', state: 'Tamil Nadu', employee_count: 27 },
    { id: uuidv4(), company_name: 'Orbit Precision Tools', gst_number: '06AACO8765F1Z4', industry: 'Manufacturing', state: 'Haryana', employee_count: 9 },
  ]

  for (const c of companies) {
    await pool.query(
      `INSERT INTO companies (id, owner_user_id, company_name, gst_number, industry, state, employee_count)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [c.id, userId, c.company_name, c.gst_number, c.industry, c.state, c.employee_count]
    )
  }
  const [sanskriti, bharat, nilgiri, orbit] = companies

  const records = [
    { company: sanskriti, type: 'gst', issue: '2023-04-01', expiry: addDays(12), notes: 'Monthly return filing due.' },
    { company: sanskriti, type: 'factory_license', issue: '2022-01-15', expiry: addDays(-5), notes: 'Renewal application pending with inspector.' },
    { company: sanskriti, type: 'fire_noc', issue: '2024-06-01', expiry: addDays(210), notes: '' },
    { company: bharat, type: 'pf', issue: '2021-11-01', expiry: addDays(25), notes: 'ECR filing pending for June.' },
    { company: bharat, type: 'esi', issue: '2021-11-01', expiry: addDays(60), notes: '' },
    { company: bharat, type: 'pollution_noc', issue: '2023-03-10', expiry: addDays(-30), notes: 'CTO renewal overdue — priority.' },
    { company: nilgiri, type: 'trade_license', issue: '2024-02-01', expiry: addDays(9), notes: '' },
    { company: nilgiri, type: 'gst', issue: '2023-01-01', expiry: addDays(120), notes: '' },
    { company: orbit, type: 'factory_license', issue: '2022-08-01', expiry: addDays(3), notes: 'Documents ready for filing.' },
    { company: orbit, type: 'gst', issue: '2023-05-01', expiry: addDays(45), notes: '' },
  ]

  for (const r of records) {
    await pool.query(
      `INSERT INTO compliance_records (id, company_id, compliance_type_id, issue_date, expiry_date, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), r.company.id, r.type, r.issue, r.expiry, r.notes]
    )
  }

  const tasks = [
    { company: sanskriti, title: 'Renew Factory License — Sanskriti Textiles', assigned_to: 'Consultant', due: addDays(2), status: 'In Progress' },
    { company: bharat, title: 'File PF ECR for June — Bharat Auto', assigned_to: 'HR', due: addDays(5), status: 'Open' },
    { company: bharat, title: 'Submit Pollution NOC renewal docs', assigned_to: 'Consultant', due: addDays(-2), status: 'Open' },
    { company: nilgiri, title: 'Collect Trade License renewal fee receipt', assigned_to: 'Admin', due: addDays(6), status: 'Open' },
    { company: sanskriti, title: 'Upload Fire NOC inspection photos', assigned_to: 'Admin', due: addDays(30), status: 'Completed' },
  ]

  for (const t of tasks) {
    await pool.query(
      `INSERT INTO tasks (id, company_id, title, assigned_to, due_date, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), t.company.id, t.title, t.assigned_to, t.due, t.status]
    )
  }

  console.log('✓ Demo data seeded.')
  console.log(`  Login with: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`)
  await pool.end()
}

run().catch((err) => {
  console.error('Seeding demo data failed:', err)
  process.exit(1)
})
