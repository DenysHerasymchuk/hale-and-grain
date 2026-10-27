import type { ProblemDetails } from '@/types/api'

const API_BASE = '/api/v1'

export class ApiError extends Error {
  readonly status: number
  readonly problem: ProblemDetails

  constructor(status: number, problem: ProblemDetails) {
    super(problem.detail ?? problem.title ?? `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.problem = problem
  }

  get messages(): string[] {
    const fieldErrors = Object.values(this.problem.errors ?? {}).flat()
    return fieldErrors.length > 0 ? fieldErrors : [this.message]
  }
}

type QueryValue = string | number | boolean | undefined | null

export function toQueryString(params: object): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params) as [string, QueryValue][]) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

async function request<T>(method: string, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const raw = body === undefined || body instanceof FormData
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      signal,
      credentials: 'same-origin',
      headers: raw ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: raw ? (body as FormData | undefined) : JSON.stringify(body),
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, { title: 'We could not reach the store. Check your connection and try again.' })
  }

  if (!response.ok) {
    const problem = await readProblem(response)
    throw new ApiError(response.status, problem)
  }

  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return undefined as T
  }
  return (await response.json()) as T
}

async function readProblem(response: Response): Promise<ProblemDetails> {
  try {
    return (await response.json()) as ProblemDetails
  } catch {
    return { status: response.status, title: response.statusText || 'Request failed' }
  }
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>('GET', path, undefined, signal),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T = void>(path: string) => request<T>('DELETE', path),
  upload: <T>(path: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return request<T>('POST', path, form)
  },
}
