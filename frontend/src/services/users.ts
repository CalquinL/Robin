import { apiClient } from './apiClient'
import type { ApiMeta } from '../types/api'
import type { Publication } from '../types/publication'
import type { ChangePasswordBody, UpdateProfileBody, User } from '../types/user'

export const usersService = {
  async getMe(userId: string): Promise<User> {
    const { data } = await apiClient.get<User>(`/users/profile/${userId}`)
    return data
  },

  async listByUser(
    userId: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<{ publications: Publication[]; meta?: ApiMeta }> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    const { data, meta } = await apiClient.get<Publication[]>(
      `/users/${userId}/publications${qs ? `?${qs}` : ''}`,
    )
    return { publications: data, meta }
  },

  async updateMe(body: UpdateProfileBody): Promise<User> {
    const { data } = await apiClient.patch<User>('/users/update', body)
    return data
  },

  async changePassword(body: ChangePasswordBody): Promise<User> {
    const { data } = await apiClient.patch<User>('/users/update', body)
    return data
  },
}
