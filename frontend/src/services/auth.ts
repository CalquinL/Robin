import { apiClient } from './apiClient'
import type { AuthUser, RegisterBody, User } from '../types/user'

interface LoginResponse {
  user: AuthUser
  token: string
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/users/login', { email, password })
    return data
  },

  async register(body: RegisterBody): Promise<User> {
    const { data } = await apiClient.post<User>('/users/register', body)
    return data
  },
}
