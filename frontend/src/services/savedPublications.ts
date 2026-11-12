import type { ApiMeta } from '../types/api'
import type { Publication } from '../types/publication'
import { apiClient } from './apiClient'

interface ListSavedParams {
  page?: number
  limit?: number
}

function buildQuery(params: ListSavedParams): string {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

export const savedPublicationsService = {
  async list(params: ListSavedParams = {}): Promise<{ publications: Publication[]; meta?: ApiMeta }> {
    const { data, meta } = await apiClient.get<Publication[]>(`/users/saved-publications${buildQuery(params)}`)
    return { publications: data, meta }
  },

  async save(publicationId: string): Promise<void> {
    await apiClient.post('/users/saved-publications', { publication_id: publicationId })
  },

  async unsave(publicationId: string): Promise<void> {
    await apiClient.delete(`/users/saved-publications/${publicationId}`)
  },
}
