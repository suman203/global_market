export class HttpError extends Error {
  status: number
  fieldErrors?: Record<string, string>

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export function queryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  }
  const s = search.toString()
  return s ? `?${s}` : ''
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  })

  if (!response.ok) {
    let message = response.statusText || `Request failed (${response.status})`
    let fieldErrors: Record<string, string> | undefined
    try {
      const body = await response.json()
      if (body?.message) message = body.message
      if (body?.fieldErrors) fieldErrors = body.fieldErrors
    } catch {
      // non-JSON error body
    }
    throw new HttpError(response.status, message, fieldErrors)
  }

  if (response.status === 204) return undefined as T
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) return (await response.json()) as T
  return undefined as T
}

export const get = <T>(path: string, options?: RequestInit) =>
  request<T>(path, { method: 'GET', ...options })

export const post = <T>(path: string, body?: unknown, options?: RequestInit) =>
  request<T>(path, { method: 'POST', body: body != null ? JSON.stringify(body) : undefined, ...options })

export const put = <T>(path: string, body?: unknown, options?: RequestInit) =>
  request<T>(path, { method: 'PUT', body: body != null ? JSON.stringify(body) : undefined, ...options })

export const del = <T>(path: string, options?: RequestInit) =>
  request<T>(path, { method: 'DELETE', ...options })
