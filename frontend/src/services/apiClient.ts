import type { ApiErrorBody, ApiMeta } from '../types/api'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1'
const TOKEN_STORAGE_KEY = 'robin_token'

export class ApiError extends Error {
  statusCode: number
  code: string
  details: ApiErrorBody['details']

  constructor(body: ApiErrorBody, statusCode: number) {
    super(body.message)
    this.statusCode = statusCode
    this.code = body.code
    this.details = body.details
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  isFormData?: boolean
}

interface ApiResult<T> {
  data: T
  meta?: ApiMeta
}

let onUnauthenticated: (() => void) | null = null

export function setUnauthenticatedHandler(handler: (() => void) | null): void {
  onUnauthenticated = handler
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const { method = 'GET', body, isFormData = false } = options
  const headers: Record<string, string> = {}

  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let requestBody: BodyInit | undefined
  if (body !== undefined) {
    if (isFormData) {
      requestBody = body as FormData
    } else {
      headers['Content-Type'] = 'application/json'
      requestBody = JSON.stringify(body)
    }
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, { method, headers, body: requestBody })
  } catch {
    throw new ApiError({ code: 'NETWORK_ERROR', message: 'No pudimos conectar con el servidor', details: [] }, 0)
  }

  if (response.status === 204) {
    return { data: null as T }
  }

  const payload = await response.json()

  if (!response.ok) {
    if (response.status === 401) {
      onUnauthenticated?.()
    }
    throw new ApiError(payload.error, response.status)
  }

  return { data: payload.data as T, meta: payload.meta as ApiMeta | undefined }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown, isFormData = false) =>
    request<T>(path, { method: 'POST', body, isFormData }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, isFormData = false) =>
    request<T>(path, { method: 'PUT', body, isFormData }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
