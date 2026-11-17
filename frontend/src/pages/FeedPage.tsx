import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { ErrorMessage } from '../components/ErrorMessage'
import { Loading } from '../components/Loading'
import { PublicationCard } from '../components/PublicationCard'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { usePublications } from '../hooks/usePublications'
import { formatRelativeTime } from '../utils/formatRelativeTime'
import './FeedPage.css'

const LIMIT = 10
const RECENT_NOTIFICATIONS_LIMIT = 3

interface FeedLocationState {
  publicationCreated?: boolean
  imageFailed?: boolean
}

export function FeedPage() {
  const { user } = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const search = searchParams.get('search') ?? undefined
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [search])

  const { data, meta, loading, error, reload } = usePublications({ page, limit: LIMIT, search })
  const {
    data: recentNotifications,
    loading: notificationsLoading,
    error: notificationsError,
  } = useNotifications({ page: 1, limit: RECENT_NOTIFICATIONS_LIMIT })
  const isBeneficiario = user?.role === 'beneficiario'
  const userInitial = user?.name.charAt(0).toUpperCase() ?? '?'
  const locationState = location.state as FeedLocationState | null
  const publicationCreated = Boolean(locationState?.publicationCreated)
  const imageFailed = Boolean(locationState?.imageFailed)

  return (
    <>
      <aside className="left-aside">
        <div className="card-box user-profile-card">
          <div className="user-info-header">
            <div className="avatar-circle">{userInitial}</div>
            <h4>{user?.name}</h4>
          </div>
          <div className="user-profile-actions">
            <Link to="/profile" className="btn-action btn-secondary">
              Editar Perfil
            </Link>
            <Link to="/profile?view=saved" className="btn-action btn-secondary">
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              Guardados
            </Link>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {publicationCreated && (
          <p className="form-banner-success">
            Tu publicación fue enviada y está pendiente de aprobación por un administrador.
          </p>
        )}
        {imageFailed && (
          <p className="form-banner-error">
            La publicación se creó, pero la imagen no se pudo subir. Puedes intentarlo de nuevo más tarde.
          </p>
        )}

        {isBeneficiario && (
          <Link to="/publications/new" className="create-post">
            <div className="avatar-circle">{userInitial}</div>
            <span className="create-post-text">¿Qué necesidad quieres compartir hoy?</span>
          </Link>
        )}

        {loading && <Loading label="Cargando publicaciones..." />}
        {!loading && error && <ErrorMessage message={error} onRetry={reload} />}
        {!loading && !error && data.length === 0 && (
          <EmptyState
            message={
              search
                ? `No encontramos resultados para "${search}".`
                : 'Todavía no hay publicaciones aprobadas.'
            }
          />
        )}

        {!loading && !error && data.length > 0 && (
          <>
            {data.map((publication) => (
              <PublicationCard key={publication._id} publication={publication} />
            ))}

            {meta && meta.pages > 1 && (
              <div className="pager">
                <button
                  type="button"
                  className="btn-action btn-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </button>
                <span>
                  Página {meta.page} de {meta.pages}
                </span>
                <button
                  type="button"
                  className="btn-action btn-secondary"
                  disabled={page >= meta.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <aside className="right-aside">
        {isBeneficiario && (
          <Link to="/publications/new" className="create-post-btn">
            + Crear Nueva Publicación
          </Link>
        )}

        <div className="card-box">
          <h3 className="card-title">Novedades</h3>

          {notificationsLoading && <p className="date-info">Cargando...</p>}
          {!notificationsLoading && notificationsError && (
            <p className="form-error">{notificationsError}</p>
          )}
          {!notificationsLoading && !notificationsError && recentNotifications.length === 0 && (
            <p className="date-info">No tienes novedades por ahora.</p>
          )}
          {!notificationsLoading && !notificationsError && recentNotifications.length > 0 && (
            <ul className="recent-notifications-list">
              {recentNotifications.map((notification) => (
                <li key={notification._id}>
                  <Link to="/notifications" className="recent-notification-item">
                    <p>{notification.message}</p>
                    <span className="date-info">{formatRelativeTime(notification.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
