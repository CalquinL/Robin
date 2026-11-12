import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setUnauthenticatedHandler } from '../services/apiClient'
import { authService } from '../services/auth'
import { usersService } from '../services/users'
import type { AuthUser, RegisterBody } from '../types/user'
import { decodeToken, isTokenExpired } from '../utils/jwt'
import { AuthContext } from './AuthContext'

const TOKEN_STORAGE_KEY = 'robin_token'

function getValidStoredToken(): string | null {
  const stored = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (!stored) return null

  const payload = decodeToken(stored)
  if (!payload || isTokenExpired(payload)) {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    return null
  }

  return stored
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getValidStoredToken)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(() => getValidStoredToken() !== null)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    setUnauthenticatedHandler(logout)
    return () => setUnauthenticatedHandler(null)
  }, [logout])

  useEffect(() => {
    if (!token) return

    const payload = decodeToken(token)
    if (!payload) return

    usersService
      .getMe(payload.id)
      .then((profile) => {
        setUser({ id: profile._id, name: profile.name, nick: profile.nick, role: profile.role })
      })
      .catch(() => {
        logout()
      })
      .finally(() => setIsLoading(false))
  }, [token, logout])

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password)
    localStorage.setItem(TOKEN_STORAGE_KEY, result.token)
    setToken(result.token)
    setUser(result.user)
  }, [])

  const register = useCallback(async (body: RegisterBody) => {
    await authService.register(body)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!token) return
    const payload = decodeToken(token)
    if (!payload) return
    const profile = await usersService.getMe(payload.id)
    setUser({ id: profile._id, name: profile.name, nick: profile.nick, role: profile.role })
  }, [token])

  const value = useMemo(
    () => ({ user, token, isAuthenticated: Boolean(user), isLoading, login, register, logout, refreshUser }),
    [user, token, isLoading, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
