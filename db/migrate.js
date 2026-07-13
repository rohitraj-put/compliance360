import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'
import 'dotenv/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  })

  const dbName = process.env.DB_NAME || 'Compliance360'

  try {
    console.log(`Creating database "${dbName}" if it does not exist...`)
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    await connection.changeUser({ database: dbName })

    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
    console.log('Applying schema.sql...')
    await connection.query(schemaSql)

    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8')
    console.log('Applying seed.sql (reference data)...')
    await connection.query(seedSql)

    console.log('✓ Migration complete.')
  } finally {
    await connection.end()
  }
}

run().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
