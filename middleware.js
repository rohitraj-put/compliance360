import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_API_PREFIXES = ['/api/auth/register', '/api/auth/login', '/api/auth/logout', '/api/uploads']
const PUBLIC_PAGES = ['/login', '/register']
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'c360_session'

function secretKey() {
  return new TextEncoder().encode(process.env.JWT_SECRET || '')
}

async function readSession(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretKey())
    return { id: payload.sub, email: payload.email, role: payload.role }
  } catch {
    return null
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const isApi = pathname.startsWith('/api')
  const isPublicApi = PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))
  const isPublicPage = PUBLIC_PAGES.includes(pathname)

  if (isApi && isPublicApi) {
    return NextResponse.next()
  }

  const user = await readSession(request)

  if (isApi) {
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }
    const headers = new Headers(request.headers)
    headers.set('x-user-id', user.id)
    headers.set('x-user-email', user.email || '')
    headers.set('x-user-role', user.role || '')
    return NextResponse.next({ request: { headers } })
  }

  // Page routes
  if (isPublicPage) {
    if (user) return NextResponse.redirect(new URL('/', request.url))
    return NextResponse.next()
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
