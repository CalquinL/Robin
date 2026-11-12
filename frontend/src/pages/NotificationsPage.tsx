import { useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { ErrorMessage } from '../components/ErrorMessage'
import { Loading } from '../components/Loading'
import { useNotifications } from '../hooks/useNotifications'
import { notificationsService } from '../services/notifications'
import type { NotificationType } from '../types/domain'
import { getErrorMessage } from '../utils/errorMessages'
import { formatRelativeTime } from '../utils/formatRelativeTime'
import './NotificationsPage.css'

const TYPE_LABEL: Record<NotificationType, string> = {
  confirmación: 'Confirmación',
  'alerta pendiente': 'Alerta',
  conflicto: 'Conflicto',
}

const TYPE_STYLE: Record<NotificationType, string> = {
  confirmación: 'success',
  'alerta pendiente': 'warning',
  conflicto: 'danger',
}

export function NotificationsPage() {
  const { data, loading, error, reload } = useNotifications({ page: 1, limit: 50 })
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  async function handleMarkRead(id: string, isRead: boolean) {
    if (isRead || pendingId || isMarkingAll) return
    setActionError(null)
    setPendingId(id)
    try {
      await notificationsService.markRead(id)
      reload()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setPendingId(null)
    }
  }

  async function handleMarkAllRead() {
    if (isMarkingAll || pendingId) return
    setActionError(null)
    setIsMarkingAll(true)
    const unread = data.filter((n) => !n.read)
    try {
      await Promise.all(unread.map((n) => notificationsService.markRead(n._id)))
      reload()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setIsMarkingAll(false)
    }
  }

  const hasUnread = data.some((n) => !n.read)

  return (
    <main className="main-content">
      <div className="notifications-page-header">
        <h2 className="page-title">Notificaciones</h2>
        {hasUnread && (
          <button
            type="button"
            className="btn-mark-read"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll || pendingId !== null}
          >
            {isMarkingAll ? 'Marcando...' : 'Marcar todas como leídas'}
          </button>
        )}
      </div>

      {actionError && <p className="form-banner-error">{actionError}</p>}

      {loading && <Loading label="Cargando notificaciones..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={reload} />}
      {!loading && !error && data.length === 0 && (
        <EmptyState message="No tienes notificaciones por ahora." />
      )}

      {!loading && !error && data.length > 0 && (
        <div className="donations-list">
          {data.map((notification) => (
            <button
              key={notification._id}
              type="button"
              className={`notification-item${notification.read ? '' : ' unread'}`}
              data-style={TYPE_STYLE[notification.type]}
              disabled={pendingId === notification._id || isMarkingAll}
              onClick={() => handleMarkRead(notification._id, notification.read)}
            >
              <div className="notification-content">
                <div>
                  <span className="notification-type">{TYPE_LABEL[notification.type]}</span>
                  <p>{notification.message}</p>
                </div>
                <span className="notification-time">{formatRelativeTime(notification.created_at)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  )
}
