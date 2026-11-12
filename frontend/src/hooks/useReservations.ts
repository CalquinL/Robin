import { useCallback, useEffect, useState } from 'react'
import { reservationsService } from '../services/reservations'
import type { ApiMeta } from '../types/api'
import type { ReservationStatus } from '../types/domain'
import type { Reservation } from '../types/reservation'
import { getErrorMessage } from '../utils/errorMessages'

interface UseReservationsParams {
  page: number
  limit: number
  status?: ReservationStatus
}

export function useReservations({ page, limit, status }: UseReservationsParams) {
  const [data, setData] = useState<Reservation[]>([])
  const [meta, setMeta] = useState<ApiMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    reservationsService
      .list({ page, limit, status })
      .then((result) => {
        setData(result.reservations)
        setMeta(result.meta ?? null)
      })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [page, limit, status])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, meta, loading, error, reload }
}
