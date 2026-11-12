import { useCallback, useEffect, useState } from 'react'
import { publicationsService } from '../services/publications'
import type { ApiMeta } from '../types/api'
import type { PublicationStatus } from '../types/domain'
import type { Publication } from '../types/publication'
import { getErrorMessage } from '../utils/errorMessages'

interface UsePublicationsParams {
  page: number
  limit: number
  status?: PublicationStatus
  search?: string
}

export function usePublications({ page, limit, status, search }: UsePublicationsParams) {
  const [data, setData] = useState<Publication[]>([])
  const [meta, setMeta] = useState<ApiMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    publicationsService
      .list({ page, limit, status, search })
      .then((result) => {
        setData(result.publications)
        setMeta(result.meta ?? null)
      })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [page, limit, status, search])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, meta, loading, error, reload }
}
