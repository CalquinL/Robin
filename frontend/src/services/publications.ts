import type { PublicationStatus } from '../types/domain'
import type { CreatePublicationBody, Publication } from '../types/publication'
import { apiClient } from './apiClient'
import type { ApiMeta } from '../types/api'

interface ListPublicationsParams {
  page?: number
  limit?: number
  status?: PublicationStatus
  search?: string
}

function buildQuery(params: ListPublicationsParams): string {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.status) query.set('status', params.status)
  if (params.search) query.set('search', params.search)
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

export const publicationsService = {
  async list(params: ListPublicationsParams = {}): Promise<{ publications: Publication[]; meta?: ApiMeta }> {
    const { data, meta } = await apiClient.get<Publication[]>(`/publications${buildQuery(params)}`)
    return { publications: data, meta }
  },

  async moderate(id: string, status: Extract<PublicationStatus, 'aprobada' | 'rechazada'>): Promise<Publication> {
    const { data } = await apiClient.patch<Publication>(`/publications/${id}/status`, { status })
    return data
  },

  async getById(id: string): Promise<Publication> {
    const { data } = await apiClient.get<Publication>(`/publications/${id}`)
    return data
  },

  async create(body: CreatePublicationBody): Promise<Publication> {
    const { data } = await apiClient.post<Publication>('/publications', body)
    return data
  },
}
