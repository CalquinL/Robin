import './ErrorMessage.css'

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="error-state">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn-action btn-secondary" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  )
}
