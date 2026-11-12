import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export function NotFoundPage() {
  return (
    <main className="main-content">
      <div className="card-box not-found-card">
        <h2 className="page-title">Página no encontrada</h2>
        <p>Esto no existe o se movió de lugar.</p>
        <Link to="/" className="btn-action btn-primary">
          Volver al Feed
        </Link>
      </div>
    </main>
  )
}
