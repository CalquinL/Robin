import { useEffect, useState, type SubmitEvent } from 'react'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { notificationsService } from '../services/notifications'
import './Navbar.css'

function navBtnClass({ isActive }: { isActive: boolean }) {
  return `nav-btn${isActive ? ' active' : ''}`
}

export function Navbar() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [searchText, setSearchText] = useState(searchParams.get('search') ?? '')

  useEffect(() => {
    notificationsService
      .list({ read: false, limit: 1 })
      .then((result) => setUnreadNotificationsCount(result.meta?.total ?? 0))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setSearchText(searchParams.get('search') ?? '')
  }, [searchParams])

  function handleSearchSubmit(event: SubmitEvent) {
    event.preventDefault()
    const trimmed = searchText.trim()
    navigate(trimmed ? `/?search=${encodeURIComponent(trimmed)}` : '/')
  }

  return (
    <nav className="navbar">
      <form className="nav-left" onSubmit={handleSearchSubmit} role="search">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          aria-label="Buscar"
          placeholder="Buscar historias, necesidades, beneficiarios..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          maxLength={100}
        />
      </form>

      <div className="nav-right">
        <NavLink to="/" end className={navBtnClass}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
            <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
            <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
          </svg>
          Feed
        </NavLink>

        {!isAdmin && (
          <NavLink to="/my-donations" className={navBtnClass}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
            </svg>
            Donaciones
          </NavLink>
        )}

        {isAdmin && (
          <NavLink to="/admin/review" className={navBtnClass}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3l8 -8" />
              <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9" />
            </svg>
            Moderar
          </NavLink>
        )}

        <NavLink to="/notifications" className={navBtnClass}>
          <div className="nav-btn-content">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
              <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
            </svg>
            Notificaciones
            {unreadNotificationsCount > 0 && (
              <span className="notification-badge">{unreadNotificationsCount}</span>
            )}
          </div>
        </NavLink>

        <NavLink to="/profile" className={navBtnClass}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="7" r="4" />
            <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
          </svg>
          Perfil
        </NavLink>
      </div>
    </nav>
  )
}
