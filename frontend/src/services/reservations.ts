import type { ApiMeta } from '../types/api'
import type { ReservationStatus } from '../types/domain'
import type { Reservation } from '../types/reservation'
import { apiClient } from './apiClient'

interface ListReservationsParams {
  page?: number
  limit?: number
  status?: ReservationStatus
}

function buildQuery(params: ListReservationsParams): string {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.status) query.set('status', params.status)
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

export const reservationsService = {
  async create(publicationId: string, itemId: string): Promise<Reservation> {
    const { data } = await apiClient.post<Reservation>('/reservations', {
      publication_id: publicationId,
      item_id: itemId,
    })
    return data
  },

  async list(params: ListReservationsParams = {}): Promise<{ reservations: Reservation[]; meta?: ApiMeta }> {
    const { data, meta } = await apiClient.get<Reservation[]>(`/reservations${buildQuery(params)}`)
    return { reservations: data, meta }
  },

  async updateStatus(id: string, status: Extract<ReservationStatus, 'cancelada' | 'entregado'>): Promise<Reservation> {
    const { data } = await apiClient.patch<Reservation>(`/reservations/${id}/status`, { status })
    return data
  },
}
