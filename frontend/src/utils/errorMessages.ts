import { ApiError } from '../services/apiClient'

const MESSAGES_BY_CODE: Record<string, string> = {
  VALIDATION_ERROR: 'Revisa los campos marcados',
  UNAUTHENTICATED: 'Tu sesión expiró. Inicia sesión de nuevo',
  TOKEN_EXPIRED: 'Tu sesión expiró. Inicia sesión de nuevo',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos',
  FORBIDDEN: 'No tienes permiso para esta acción',
  NOT_FOUND: 'Esto ya no está disponible',
  NEED_NOT_AVAILABLE: 'Otra persona reservó este ítem hace un momento. Elige otro',
  EMAIL_ALREADY_EXISTS: 'El correo o el apodo ya están registrados',
  CONFLICT: 'Ese dato ya está en uso por otra cuenta',
  NETWORK_ERROR: 'No pudimos conectar. Revisa tu conexión y reintenta',
  INTERNAL_ERROR: 'Algo salió mal de nuestro lado. Intenta de nuevo',
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return MESSAGES_BY_CODE[error.code] ?? error.message
  }
  return MESSAGES_BY_CODE.INTERNAL_ERROR
}
