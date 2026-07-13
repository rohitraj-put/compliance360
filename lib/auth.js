import { SignJWT, jwtVerify } from 'jose'

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'c360_session'
const MAX_AGE_SECONDS = (Number(process.env.SESSION_MAX_AGE_DAYS) || 7) * 24 * 60 * 60

function secretKey() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set. Copy .env.example to .env and set it.')
  return new TextEncoder().encode(secret)
}

export async function signSession(user) {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey())
}

export async function verifySession(token) {
  const { payload } = await jwtVerify(token, secretKey())
  return { id: payload.sub, email: payload.email, role: payload.role }
}

export const SESSION_COOKIE = COOKIE_NAME
export const SESSION_MAX_AGE = MAX_AGE_SECONDS

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  }
}
