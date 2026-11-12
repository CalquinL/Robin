import { useCallback, useEffect, useState } from 'react'
import { savedPublicationsService } from '../services/savedPublications'
import type { ApiMeta } from '../types/api'
import type { Publication } from '../types/publication'
import { getErrorMessage } from '../utils/errorMessages'

interface UseSavedPublicationsListParams {
  page: number
  limit: number
}

export function useSavedPublicationsList({ page, limit }: UseSavedPublicationsListParams) {
  const [data, setData] = useState<Publication[]>([])
  const [meta, setMeta] = useState<ApiMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    savedPublicationsService
      .list({ page, limit })
      .then((result) => {
        setData(result.publications)
        setMeta(result.meta ?? null)
      })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [page, limit])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, meta, loading, error, reload }
}
