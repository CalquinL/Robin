import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorMessage } from '../components/ErrorMessage'
import { Loading } from '../components/Loading'
import { useAuth } from '../hooks/useAuth'
import { usePublication } from '../hooks/usePublication'
import { useSavedPublications } from '../hooks/useSavedPublications'
import { reservationsService } from '../services/reservations'
import type { Need } from '../types/publication'
import { getErrorMessage } from '../utils/errorMessages'
import './PublicationDetailPage.css'

const NEED_STATUS_LABEL: Record<Need['status'], string> = {
  disponible: 'Disponible',
  reservado: 'Reservado',
  entregado: 'Entregado',
}

const NEED_STATUS_BADGE: Record<Need['status'], string> = {
  disponible: 'badge-green',
  reservado: 'badge-orange',
  entregado: 'badge-green',
}

export function PublicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: publication, loading, error, reload } = usePublication(id ?? '')
  const { isSaved, toggleSave, pendingId: pendingSaveId } = useSavedPublications()
  const [reserveError, setReserveError] = useState<string | null>(null)
  const [reserveSuccess, setReserveSuccess] = useState(false)
  const [pendingItemId, setPendingItemId] = useState<string | null>(null)

  async function handleReserve(itemId: string) {
    if (!publication) return
    setReserveError(null)
    setReserveSuccess(false)
    setPendingItemId(itemId)
    try {
      await reservationsService.create(publication._id, itemId)
      setReserveSuccess(true)
      reload()
    } catch (err) {
      setReserveError(getErrorMessage(err))
    } finally {
      setPendingItemId(null)
    }
  }

  if (loading) {
    return (
      <main className="main-content detail-page">
        <Loading label="Cargando publicación..." />
      </main>
    )
  }

  if (error || !publication) {
    return (
      <main className="main-content detail-page">
        <ErrorMessage message={error ?? 'Esto ya no está disponible'} onRetry={reload} />
      </main>
    )
  }

  const total = publication.necesidades.length
  const completed = publication.necesidades.filter((n) => n.status !== 'disponible').length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const authorInitial = publication.author?.name.charAt(0).toUpperCase() ?? '?'
  const authorName = publication.author?.name ?? 'Beneficiario'
  const imageUrl = publication.file ? `/uploads/publications/${publication.file}` : null

  return (
    <main className="main-content detail-page">
      <Link to="/" className="btn-back">
        ← Volver al Feed
      </Link>

      <div className="detail-container">
        <div className="detail-info">
          <div className="detail-user">
            <div className="avatar-circle">{authorInitial}</div>
            <div className="detail-user-info">
              <h2>{authorName}</h2>
              <span className="badge-verified">✓ Publicación verificada</span>
            </div>
            <button
              type="button"
              className={`btn-action ${isSaved(publication._id) ? 'btn-primary' : 'btn-secondary'} detail-save-btn`}
              disabled={pendingSaveId === publication._id}
              onClick={() => toggleSave(publication._id)}
            >
              {isSaved(publication._id) ? 'Guardado' : 'Guardar'}
            </button>
          </div>
          <p className="detail-description">{publication.text}</p>
          {imageUrl ? (
            <img src={imageUrl} alt={`Imagen de la publicación de ${authorName}`} className="story-image-photo" />
          ) : (
            <div className="story-image">🖼️ Imagen de la publicación</div>
          )}
        </div>

        <div className="detail-items-container">
          <h3 className="view-subtitle">Necesidades</h3>

          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${percentage}%` }} />
              <div className="progress-text">{percentage}% Completado</div>
            </div>
          </div>

          {reserveSuccess && <p className="form-banner-success">¡Reservaste este ítem! Revisa "Mis donaciones".</p>}
          {reserveError && <p className="form-banner-error">{reserveError}</p>}

          <div className="story-items">
            {publication.necesidades.map((need) => (
              <div key={need._id} className="story-item">
                <span>{need.name}</span>
                <span className={`badge ${NEED_STATUS_BADGE[need.status]}`}>
                  {NEED_STATUS_LABEL[need.status]}
                </span>
                {user?.role === 'donante' && need.status === 'disponible' && (
                  <button
                    type="button"
                    className="btn-reserve"
                    disabled={pendingItemId === need._id}
                    onClick={() => handleReserve(need._id)}
                  >
                    Reservar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
