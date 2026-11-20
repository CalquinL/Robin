import { Link } from 'react-router-dom'
import { useSavedPublications } from '../hooks/useSavedPublications'
import type { Publication } from '../types/publication'
import { formatRelativeTime } from '../utils/formatRelativeTime'
import './PublicationCard.css'

export function PublicationCard({ publication }: { publication: Publication }) {
  const { isSaved, toggleSave, pendingId } = useSavedPublications()
  const authorInitial = publication.author?.name.charAt(0).toUpperCase() ?? '?'
  const authorName = publication.author?.name ?? 'Beneficiario'
  const imageUrl = publication.file ? `/uploads/publications/${publication.file}` : null
  const saved = isSaved(publication._id)

  return (
    <div className="story-card">
      <div className="story-header">
        <div className="story-user">
          <div className="avatar-circle">{authorInitial}</div>
          <div className="story-info">
            <h4>
              {authorName}{' '}
              {publication.status === 'aprobada' && (
                <span className="badge-verified">✓ Historia verificada</span>
              )}
            </h4>
            <span>{formatRelativeTime(publication.created_at)}</span>
          </div>
        </div>
        <div className="story-actions">
          <button
            type="button"
            className={`btn-action ${saved ? 'btn-primary' : 'btn-secondary'}`}
            disabled={pendingId === publication._id}
            onClick={() => toggleSave(publication._id)}
          >
            {saved ? 'Guardado' : 'Guardar'}
          </button>
          <Link to={`/publications/${publication._id}`} className="btn-action btn-primary">
            Ver Necesidades
          </Link>
        </div>
      </div>
      <div className="story-content">
        <p>{publication.text}</p>
        {imageUrl ? (
          <img src={imageUrl} alt={`Imagen de la publicación de ${authorName}`} className="story-image-photo" />
        ) : (
          <div className="story-image">🖼️ Imagen de la publicación</div>
        )}
      </div>
    </div>
  )
}
