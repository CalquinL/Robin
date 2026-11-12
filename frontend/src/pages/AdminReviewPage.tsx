import { useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { ErrorMessage } from '../components/ErrorMessage'
import { Loading } from '../components/Loading'
import { usePublications } from '../hooks/usePublications'
import { publicationsService } from '../services/publications'
import { formatRelativeTime } from '../utils/formatRelativeTime'
import { getErrorMessage } from '../utils/errorMessages'

export function AdminReviewPage() {
  const { data, loading, error, reload } = usePublications({ page: 1, limit: 50, status: 'pendiente' })
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingActionId, setPendingActionId] = useState<string | null>(null)

  async function handleModerate(id: string, status: 'aprobada' | 'rechazada') {
    setActionError(null)
    setPendingActionId(id)
    try {
      await publicationsService.moderate(id, status)
      reload()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setPendingActionId(null)
    }
  }

  return (
    <main className="main-content">
      <h2 className="page-title">Verificación de publicaciones</h2>

      {actionError && <p className="form-banner-error">{actionError}</p>}

      {loading && <Loading label="Cargando publicaciones pendientes..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={reload} />}
      {!loading && !error && data.length === 0 && (
        <EmptyState message="No hay publicaciones pendientes por revisar." />
      )}

      {!loading && !error && data.length > 0 && (
        <div className="donations-list">
          {data.map((publication) => (
            <div key={publication._id} className="donation-item">
              <div className="donation-item-info">
                <span className="item-name">{publication.author?.name ?? 'Beneficiario'}</span>
                <span>{publication.text}</span>
                <span className="date-info">
                  {publication.necesidades.map((need) => need.name).join(', ')} ·{' '}
                  {formatRelativeTime(publication.created_at)}
                </span>
              </div>
              <div className="admin-actions">
                <button
                  type="button"
                  className="btn-verify"
                  disabled={pendingActionId === publication._id}
                  onClick={() => handleModerate(publication._id, 'aprobada')}
                >
                  Verificar
                </button>
                <button
                  type="button"
                  className="btn-reject"
                  disabled={pendingActionId === publication._id}
                  onClick={() => handleModerate(publication._id, 'rechazada')}
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
