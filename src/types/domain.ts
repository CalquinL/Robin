export const ROLES = ["beneficiario", "donante", "admin"] as const;
export type Role = (typeof ROLES)[number];

// El admin no se asigna por registro público (sección 5): solo estos dos roles.
export const REGISTERABLE_ROLES = ["beneficiario", "donante"] as const;
export type RegisterableRole = (typeof REGISTERABLE_ROLES)[number];

export const PUBLICATION_STATUS = ["pendiente", "aprobada", "rechazada"] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUS)[number];

export const NEED_STATUS = ["disponible", "reservado", "entregado"] as const;
export type NeedStatus = (typeof NEED_STATUS)[number];

export const RESERVATION_STATUS = ["reservado", "entregado", "cancelada"] as const;
export type ReservationStatus = (typeof RESERVATION_STATUS)[number];

export const NOTIFICATION_TYPE = ["confirmación", "alerta pendiente", "conflicto"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPE)[number];
