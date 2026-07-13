export class ApiRequestError extends Error {
  constructor(message, status, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

async function handle(response) {
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    throw new ApiRequestError(data?.error || 'Request failed.', response.status, data?.details)
  }
  return data
}

export async function apiGet(path) {
  const res = await fetch(path, { credentials: 'include' })
  return handle(res)
}

export async function apiSend(method, path, body) {
  const isForm = body instanceof FormData
  const res = await fetch(path, {
    method,
    credentials: 'include',
    headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    body: isForm ? body : JSON.stringify(body ?? {}),
  })
  return handle(res)
}

export const apiPost = (path, body) => apiSend('POST', path, body)
export const apiPut = (path, body) => apiSend('PUT', path, body)
export const apiPatch = (path, body) => apiSend('PATCH', path, body)

export async function apiDelete(path) {
  const res = await fetch(path, { method: 'DELETE', credentials: 'include' })
  return handle(res)
}
