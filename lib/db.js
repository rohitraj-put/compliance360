import mysql from 'mysql2/promise'

const globalForPool = globalThis

// Reuse the pool across hot-reloads in dev so we don't exhaust connections.
export const pool =
  globalForPool.__c360Pool ||
  mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Compliance360',
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0,
    dateStrings: true,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPool.__c360Pool = pool
}
