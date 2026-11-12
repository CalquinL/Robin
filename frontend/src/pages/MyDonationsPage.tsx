import { useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { ErrorMessage } from '../components/ErrorMessage'
import { Loading } from '../components/Loading'
import { useAuth } from '../hooks/useAuth'
import { useReservations } from '../hooks/useReservations'
import { reservationsService } from '../services/reservations'
import type { ReservationStatus } from '../types/domain'
import type { Reservation } from '../types/reservation'
import { formatRelativeTime } from '../utils/formatRelativeTime'
import { getErrorMessage } from '../utils/errorMessages'

type DonorTab = 'pending' | 'delivered' | 'all'

const TAB_STATUS: Record<DonorTab, ReservationStatus | undefined> = {
  pending: 'reservado',
  delivered: 'entregado',
  all: undefined,
}

const STATUS_LABEL: Record<ReservationStatus, string> = {
  reservado: 'Reservado',
  entregado: 'Entregado',
  cancelada: 'Cancelada',
}

const STATUS_BADGE: Record<ReservationStatus, string> = {
  reservado: 'badge-orange',
  entregado: 'badge-green',
  cancelada: 'badge-red',
}

export function MyDonationsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<DonorTab>('pending')
  const isDonante = user?.role === 'donante'

  const { data, loading, error, reload } = useReservations({
    page: 1,
    limit: 50,
    status: isDonante ? TAB_STATUS[tab] : undefined,
  })

  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function handleAction(id: string, status: 'cancelada' | 'entregado') {
    setActionError(null)
    setPendingId(id)
    try {
      await reservationsService.updateStatus(id, status)
      reload()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setPendingId(null)
    }
  }

  const groups = useMemo(() => {
    if (!isDonante) return null
    const byBeneficiary = new Map<string, { name: string; items: Reservation[] }>()
    for (const reservation of data) {
      const key = reservation.beneficiary?.nick ?? 'desconocido'
      const name = reservation.beneficiary?.name ?? 'Beneficiario'
      if (!byBeneficiary.has(key)) byBeneficiary.set(key, { name, items: [] })
      byBeneficiary.get(key)!.items.push(reservation)
    }
    return Array.from(byBeneficiary.values())
  }, [data, isDonante])

  return (
    <main className="main-content">
      <h2 className="page-title">Mis Donaciones</h2>

      {isDonante && (
        <div className="donations-header">
          <div className="donations-tabs">
            <button
              type="button"
              className={`tab-btn${tab === 'pending' ? ' active' : ''}`}
              onClick={() => setTab('pending')}
            >
              Pendientes
            </button>
            <button
              type="button"
              className={`tab-btn${tab === 'delivered' ? ' active' : ''}`}
              onClick={() => setTab('delivered')}
            >
              Entregados
            </button>
            <button
              type="button"
              className={`tab-btn${tab === 'all' ? ' active' : ''}`}
              onClick={() => setTab('all')}
            >
              Todos
            </button>
          </div>
        </div>
      )}

      {actionError && <p className="form-banner-error">{actionError}</p>}

      {loading && <Loading label="Cargando donaciones..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={reload} />}
      {!loading && !error && data.length === 0 && (
        <EmptyState
          message={
            isDonante ? 'No tienes donaciones en este estado.' : 'Todavía no reservaron ninguna de tus necesidades.'
          }
        />
      )}

      {!loading && !error && data.length > 0 && isDonante && groups && (
        <div className="donations-grouped-container">
          {groups.map((group) => (
            <div key={group.name} className="beneficiary-group">
              <div className="group-header">
                <div className="avatar-circle">{group.name.charAt(0).toUpperCase()}</div>
                <h4>{group.name}</h4>
              </div>
              <div className="group-items">
                {group.items.map((reservation) => (
                  <div key={reservation._id} className="donation-item">
                    <div className="donation-item-info">
                      <span className="item-name">{reservation.need_name ?? 'Ítem'}</span>
                      <span className="date-info">
                        {reservation.status === 'entregado' && reservation.delivered_at
                          ? `Entregado ${formatRelativeTime(reservation.delivered_at)}`
                          : `Reservado ${formatRelativeTime(reservation.reserved_at)}`}
                      </span>
                    </div>
                    {reservation.status === 'reservado' ? (
                      <div className="donation-actions">
                        <span className={`badge ${STATUS_BADGE[reservation.status]}`}>
                          {STATUS_LABEL[reservation.status]}
                        </span>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="btn-confirm"
                            disabled={pendingId === reservation._id}
                            onClick={() => handleAction(reservation._id, 'entregado')}
                          >
                            Confirmar Entrega
                          </button>
                          <button
                            type="button"
                            className="btn-cancel"
                            disabled={pendingId === reservation._id}
                            onClick={() => handleAction(reservation._id, 'cancelada')}
                          >
                            Cancelar reserva
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className={`badge ${STATUS_BADGE[reservation.status]}`}>
                        {STATUS_LABEL[reservation.status]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && data.length > 0 && !isDonante && (
        <>
          <h3 className="view-subtitle">Estado de mis Necesidades</h3>
          <div className="donations-list">
            {data.map((reservation) => (
              <div key={reservation._id} className="donation-item">
                <div className="donation-item-info">
                  <span className="item-name">{reservation.need_name ?? 'Ítem'}</span>
                  <div className="beneficiary-mini-info">
                    <div className="avatar-circle">{(reservation.donor?.name ?? '?').charAt(0).toUpperCase()}</div>
                    <span className="beneficiary-name">{reservation.donor?.name ?? 'Donante'}</span>
                  </div>
                </div>
                {reservation.status === 'reservado' ? (
                  <button
                    type="button"
                    className="btn-confirm"
                    disabled={pendingId === reservation._id}
                    onClick={() => handleAction(reservation._id, 'entregado')}
                  >
                    Confirmar Entrega
                  </button>
                ) : (
                  <span className={`badge ${STATUS_BADGE[reservation.status]}`}>
                    {STATUS_LABEL[reservation.status]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
