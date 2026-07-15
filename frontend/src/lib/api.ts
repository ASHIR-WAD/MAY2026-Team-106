import {
  users,
  events,
  orders,
  orderItems,
  notifications,
} from '../mocks/mockData'

const mockGetRoutes: Record<string, unknown> = {
  '/users': users,
  '/events': events,
  '/orders': orders,
  '/order-items': orderItems,
  '/notifications': notifications,
}

const mockPostRoutes: Record<
  string,
  (body: unknown) => unknown
> = {
  '/users': (body: unknown) => body,
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function isMockMode(): boolean {
  return import.meta.env.VITE_USE_MOCKS === 'true'
}

function apiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? ''
}

/** Normalize path for mock lookup: ensure leading slash, drop trailing slash + query. */
function normalizePath(path: string): string {
  const withoutQuery = path.split('?')[0] ?? path
  const withLeading = withoutQuery.startsWith('/')
    ? withoutQuery
    : `/${withoutQuery}`
  if (withLeading.length > 1 && withLeading.endsWith('/')) {
    return withLeading.slice(0, -1)
  }
  return withLeading
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json()
    if (
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as { message: unknown }).message === 'string'
    ) {
      return (data as { message: string }).message
    }
  } catch {
    // ignore non-JSON error bodies
  }
  return response.statusText || `Request failed with status ${response.status}`
}

async function mockGet<T>(path: string): Promise<T> {
  const key = normalizePath(path)
  if (!(key in mockGetRoutes)) {
    throw new ApiError(404, `Mock route not found: GET ${key}`)
  }
  return mockGetRoutes[key] as T
}

async function mockPost<T>(path: string, body: unknown): Promise<T> {
  const key = normalizePath(path)
  const handler = mockPostRoutes[key]
  if (!handler) {
    throw new ApiError(404, `Mock route not found: POST ${key}`)
  }
  return handler(body) as T
}

async function realRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const base = apiBaseUrl().replace(/\/$/, '')
  const normalized = normalizePath(path)
  const url = `${base}${normalized}`

  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const message = await parseErrorMessage(response)
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export async function apiGet<T>(path: string): Promise<T> {
  if (isMockMode()) {
    return mockGet<T>(path)
  }
  return realRequest<T>(path, { method: 'GET' })
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  if (isMockMode()) {
    return mockPost<T>(path, body)
  }
  return realRequest<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
