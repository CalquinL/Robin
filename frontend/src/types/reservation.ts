import type { ReservationStatus } from './domain'

export interface ReservationPerson {
  name: string
  nick: string
  image: string
}

export interface Reservation {
  _id: string
  publication_id: string
  item_id: string
  // La API no siempre lo incluye (POST /reservations y PATCH /status lo omiten).
  donor_id?: string
  status: ReservationStatus
  reserved_at: string
  delivered_at?: string
  // Solo en GET /reservations y GET /reservations/{id}.
  donor?: ReservationPerson
  beneficiary?: ReservationPerson
  need_name?: string
  publication_text?: string
}
