import { NextResponse } from 'next/server'
import { ApiError } from './ApiError'

// middleware.js verifies the session cookie and forwards the identity as headers,
// so route handlers don't need to re-verify the JWT on every request.
export function getUser(request) {
  const id = request.headers.get('x-user-id')
  if (!id) throw ApiError.unauthorized()
  return {
    id,
    email: request.headers.get('x-user-email'),
    role: request.headers.get('x-user-role'),
  }
}

// Wraps a route handler so thrown ApiErrors (and DB/validation errors) become clean JSON responses.
export function withErrorHandling(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context)
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json({ error: err.message, details: err.details }, { status: err.statusCode })
      }
      if (err?.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ error: 'A record with that value already exists.' }, { status: 409 })
      }
      console.error('Unhandled API error:', err)
      return NextResponse.json({ error: 'Something went wrong on our end.' }, { status: 500 })
    }
  }
}
