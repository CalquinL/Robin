import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { savedPublicationsService } from '../services/savedPublications'
import { SavedPublicationsContext } from './SavedPublicationsContext'

// Límite del servidor por página (sección 4 de CLAUDE.md). Si alguna vez se
// guardan más de 50 publicaciones, el estado "guardado" de las siguientes no
// se refleja en las tarjetas hasta recargar — aceptable para el alcance actual.
const MAX_TRACKED = 50

export function SavedPublicationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [pendingId, setPendingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setSavedIds(new Set())
      return
    }
    savedPublicationsService
      .list({ limit: MAX_TRACKED })
      .then((result) => setSavedIds(new Set(result.publications.map((p) => p._id))))
      .catch(() => {})
  }, [isAuthenticated])

  const isSaved = useCallback((publicationId: string) => savedIds.has(publicationId), [savedIds])

  const toggleSave = useCallback(
    async (publicationId: string) => {
      setPendingId(publicationId)
      try {
        if (savedIds.has(publicationId)) {
          await savedPublicationsService.unsave(publicationId)
          setSavedIds((prev) => {
            const next = new Set(prev)
            next.delete(publicationId)
            return next
          })
        } else {
          await savedPublicationsService.save(publicationId)
          setSavedIds((prev) => new Set(prev).add(publicationId))
        }
      } finally {
        setPendingId(null)
      }
    },
    [savedIds],
  )

  const value = useMemo(
    () => ({ savedIds, isSaved, toggleSave, pendingId }),
    [savedIds, isSaved, toggleSave, pendingId],
  )

  return <SavedPublicationsContext.Provider value={value}>{children}</SavedPublicationsContext.Provider>
}
