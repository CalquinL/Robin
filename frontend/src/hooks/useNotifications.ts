import { useCallback, useEffect, useState } from 'react'
import { notificationsService } from '../services/notifications'
import type { ApiMeta } from '../types/api'
import type { Notification } from '../types/notification'
import { getErrorMessage } from '../utils/errorMessages'

interface UseNotificationsParams {
  page: number
  limit: number
  read?: boolean
}

export function useNotifications({ page, limit, read }: UseNotificationsParams) {
  const [data, setData] = useState<Notification[]>([])
  const [meta, setMeta] = useState<ApiMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    notificationsService
      .list({ page, limit, read })
      .then((result) => {
        setData(result.notifications)
        setMeta(result.meta ?? null)
      })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [page, limit, read])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, meta, loading, error, reload }
}
