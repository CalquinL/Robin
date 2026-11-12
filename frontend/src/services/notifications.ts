import type { ApiMeta } from '../types/api'
import type { Notification } from '../types/notification'
import { apiClient } from './apiClient'

interface ListNotificationsParams {
  page?: number
  limit?: number
  read?: boolean
}

function buildQuery(params: ListNotificationsParams): string {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.read !== undefined) query.set('read', String(params.read))
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

export const notificationsService = {
  async list(params: ListNotificationsParams = {}): Promise<{ notifications: Notification[]; meta?: ApiMeta }> {
    const { data, meta } = await apiClient.get<Notification[]>(`/notifications${buildQuery(params)}`)
    return { notifications: data, meta }
  },

  async markRead(id: string): Promise<Notification> {
    const { data } = await apiClient.patch<Notification>(`/notifications/${id}`, { read: true })
    return data
  },
}
