import type { Role } from '../types/domain'

interface TokenPayload {
  id: string
  role: Role
  exp: number
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const payloadSegment = token.split('.')[1]
    if (!payloadSegment) return null
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    return JSON.parse(json) as TokenPayload
  } catch {
    return null
  }
}

export function isTokenExpired(payload: TokenPayload): boolean {
  return payload.exp * 1000 <= Date.now()
}
