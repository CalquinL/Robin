import { useCallback, useEffect, useState } from 'react'
import { publicationsService } from '../services/publications'
import { reservationsService } from '../services/reservations'
import { usersService } from '../services/users'
import type { Role } from '../types/domain'
import type { Publication } from '../types/publication'
import { getErrorMessage } from '../utils/errorMessages'

const LIMIT = 20

function sortByCreatedAtDesc(publications: Publication[]): Publication[] {
  return [...publications].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}

async function fetchForRole(userId: string, role: Role): Promise<Publication[]> {
  if (role === 'admin') {
    const [approved, rejected] = await Promise.all([
      publicationsService.list({ status: 'aprobada', limit: LIMIT }),
      publicationsService.list({ status: 'rechazada', limit: LIMIT }),
    ])
    return sortByCreatedAtDesc([...approved.publications, ...rejected.publications])
  }

  if (role === 'donante') {
    const { reservations } = await reservationsService.list({ status: 'entregado', limit: LIMIT })
    const publicationIds = Array.from(new Set(reservations.map((r) => r.publication_id)))
    const publications = await Promise.all(publicationIds.map((id) => publicationsService.getById(id)))
    return sortByCreatedAtDesc(publications)
  }

  const { publications } = await usersService.listByUser(userId, { limit: LIMIT })
  return publications
}

export function useProfilePublications(userId: string, role: Role) {
  const [data, setData] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(() => {
    if (!userId) return
    setLoading(true)
    setError(null)
    fetchForRole(userId, role)
      .then(setData)
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [userId, role])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, loading, error, reload }
}
