import { useCallback, useEffect, useState } from 'react'
import { usersService } from '../services/users'
import type { User } from '../types/user'
import { getErrorMessage } from '../utils/errorMessages'

export function useProfile(userId: string) {
  const [data, setData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    usersService
      .getMe(userId)
      .then((profile) => setData(profile))
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, loading, error, reload }
}
