import { useCallback, useEffect, useState } from 'react'
import { publicationsService } from '../services/publications'
import type { Publication } from '../types/publication'
import { getErrorMessage } from '../utils/errorMessages'

export function usePublication(id: string) {
  const [data, setData] = useState<Publication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    publicationsService
      .getById(id)
      .then((publication) => {
        setData(publication)
      })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, loading, error, reload }
}
