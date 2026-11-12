import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChangePasswordForm } from '../components/ChangePasswordForm'
import { EmptyState } from '../components/EmptyState'
import { ErrorMessage } from '../components/ErrorMessage'
import { Loading } from '../components/Loading'
import { PublicationCard } from '../components/PublicationCard'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useProfilePublications } from '../hooks/useProfilePublications'
import { useSavedPublications } from '../hooks/useSavedPublications'
import { useSavedPublicationsList } from '../hooks/useSavedPublicationsList'
import { usersService } from '../services/users'
import type { UpdateProfileBody, User } from '../types/user'
import { getErrorMessage } from '../utils/errorMessages'
import './ProfilePage.css'

const ROLE_LABEL: Record<string, string> = {
  beneficiario: 'Beneficiario',
  donante: 'Donante',
  admin: 'Administrador',
}

const SAVED_LIMIT = 10

interface FieldErrors {
  name?: string
  surname?: string
  nick?: string
}

export function ProfilePage() {
  const { user, refreshUser, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isSavedView = searchParams.get('view') === 'saved'

  const { data: profile, loading, error, reload } = useProfile(user?.id ?? '')

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<UpdateProfileBody>({})
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)

  function startEditing() {
    if (!profile) return
    setForm({
      name: profile.name,
      surname: profile.surname,
      nick: profile.nick,
      address: profile.address ?? '',
      phone: profile.phone ?? '',
    })
    setFieldErrors({})
    setFormError(null)
    setFormSuccess(false)
    setIsEditing(true)
  }

  function updateField<K extends keyof UpdateProfileBody>(field: K, value: UpdateProfileBody[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate(): boolean {
    const errors: FieldErrors = {}
    if (!form.name?.trim()) errors.name = 'El nombre es obligatorio'
    if (!form.surname?.trim()) errors.surname = 'El apellido es obligatorio'
    if (!form.nick?.trim()) errors.nick = 'El apodo es obligatorio'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await usersService.updateMe(form)
      await refreshUser()
      reload()
      setIsEditing(false)
      setFormSuccess(true)
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleToggleChangePassword() {
    if (isSavedView) {
      navigate('/profile')
      setShowChangePassword(true)
    } else {
      setShowChangePassword((prev) => !prev)
    }
  }

  if (loading) {
    return (
      <main className="main-content">
        <Loading label="Cargando perfil..." />
      </main>
    )
  }

  if (error || !profile) {
    return (
      <main className="main-content">
        <ErrorMessage message={error ?? 'No pudimos cargar tu perfil'} onRetry={reload} />
      </main>
    )
  }

  const initial = profile.name.charAt(0).toUpperCase()

  return (
    <>
      <aside className="left-aside">
        <div className="card-box profile-aside-card">
          <div className="avatar-circle profile-avatar">{initial}</div>
          <h2>
            {profile.name} {profile.surname}
          </h2>
          <p className="profile-role">{ROLE_LABEL[profile.role] ?? profile.role}</p>
          {!isSavedView && !isEditing && (
            <button type="button" className="btn-action btn-secondary" onClick={startEditing}>
              Editar Perfil
            </button>
          )}
          <Link to="/profile?view=saved" className="btn-action btn-secondary">
            Guardados
          </Link>
        </div>

        <div className="card-box settings-card">
          <h3 className="card-title">Configuración</h3>
          <ul className="settings-list">
            <li>
              <button type="button" className="settings-item" onClick={handleToggleChangePassword}>
                <span className="settings-text">Cambiar Contraseña</span>
              </button>
            </li>
            <li className="settings-divider" />
            <li>
              <button type="button" className="settings-item logout" onClick={handleLogout}>
                <span className="settings-text">Cerrar Sesión</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {isSavedView ? (
        <SavedPublicationsSection />
      ) : (
        <main className="main-content profile-page">
          <div className="profile-content-grid">
            <div className="profile-info-col">
              <h2 className="page-title">Mi perfil</h2>

              {formSuccess && !isEditing && <p className="form-banner-success">Tus datos se guardaron.</p>}
              {formError && <p className="form-banner-error">{formError}</p>}

              {showChangePassword ? (
                <>
                  <button type="button" className="btn-back" onClick={() => setShowChangePassword(false)}>
                    ← Volver al Perfil
                  </button>
                  <ChangePasswordForm />
                </>
              ) : !isEditing ? (
                  <div className="card-box profile-details-card">
                    <div className="profile-field">
                      <span className="profile-field-label">Nombre</span>
                      <span>
                        {profile.name} {profile.surname}
                      </span>
                    </div>
                    <div className="profile-field">
                      <span className="profile-field-label">Apodo</span>
                      <span>{profile.nick}</span>
                    </div>
                    <div className="profile-field">
                      <span className="profile-field-label">Correo</span>
                      <span>{profile.email}</span>
                    </div>
                    <div className="profile-field">
                      <span className="profile-field-label">Dirección</span>
                      <span>{profile.address || '—'}</span>
                    </div>
                    <div className="profile-field">
                      <span className="profile-field-label">Teléfono</span>
                      <span>{profile.phone || '—'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="card-box profile-details-card">
                    <form className="form-stack" onSubmit={handleSubmit} noValidate>
                      <div className="form-field">
                        <label htmlFor="profile-name">Nombre</label>
                        <input
                          id="profile-name"
                          type="text"
                          value={form.name ?? ''}
                          onChange={(e) => updateField('name', e.target.value)}
                          maxLength={50}
                        />
                        {fieldErrors.name && <span className="form-error">{fieldErrors.name}</span>}
                      </div>

                      <div className="form-field">
                        <label htmlFor="profile-surname">Apellido</label>
                        <input
                          id="profile-surname"
                          type="text"
                          value={form.surname ?? ''}
                          onChange={(e) => updateField('surname', e.target.value)}
                          maxLength={50}
                        />
                        {fieldErrors.surname && <span className="form-error">{fieldErrors.surname}</span>}
                      </div>

                      <div className="form-field">
                        <label htmlFor="profile-nick">Apodo</label>
                        <input
                          id="profile-nick"
                          type="text"
                          value={form.nick ?? ''}
                          onChange={(e) => updateField('nick', e.target.value)}
                          maxLength={30}
                        />
                        {fieldErrors.nick && <span className="form-error">{fieldErrors.nick}</span>}
                      </div>

                      <div className="form-field">
                        <label htmlFor="profile-address">Dirección</label>
                        <input
                          id="profile-address"
                          type="text"
                          value={form.address ?? ''}
                          onChange={(e) => updateField('address', e.target.value)}
                          maxLength={200}
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="profile-phone">Teléfono</label>
                        <input
                          id="profile-phone"
                          type="text"
                          value={form.phone ?? ''}
                          onChange={(e) => updateField('phone', e.target.value)}
                          maxLength={20}
                        />
                      </div>

                      <div className="profile-form-actions">
                        <button
                          type="button"
                          className="btn-action btn-secondary"
                          onClick={() => setIsEditing(false)}
                          disabled={isSubmitting}
                        >
                          Cancelar
                        </button>
                        <button type="submit" className="btn-action btn-primary" disabled={isSubmitting}>
                          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
            </div>

            {!showChangePassword && (
              <RelatedPublicationsPanel userId={profile._id} role={profile.role} />
            )}
          </div>
        </main>
      )}
    </>
  )
}

const RELATED_TITLE: Record<string, string> = {
  admin: 'Has moderado:',
  donante: 'Has donado a:',
  beneficiario: 'Mis publicaciones:',
}

const RELATED_EMPTY_MESSAGE: Record<string, string> = {
  admin: 'Todavía no has moderado ninguna publicación.',
  donante: 'Todavía no has confirmado ninguna donación.',
  beneficiario: 'Todavía no tienes publicaciones.',
}

function RelatedPublicationsPanel({ userId, role }: { userId: string; role: User['role'] }) {
  const { data, loading, error, reload } = useProfilePublications(userId, role)

  return (
    <div className="card-box related-publications-panel">
      <h3 className="card-title">{RELATED_TITLE[role]}</h3>

      {loading && <Loading label="Cargando publicaciones..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={reload} />}
      {!loading && !error && data.length === 0 && <EmptyState message={RELATED_EMPTY_MESSAGE[role]} />}
      {!loading && !error && data.length > 0 && (
        <div className="related-publications-list">
          {data.map((publication) => (
            <PublicationCard key={publication._id} publication={publication} />
          ))}
        </div>
      )}
    </div>
  )
}

function SavedPublicationsSection() {
  const [page, setPage] = useState(1)
  const { data, meta, loading, error, reload } = useSavedPublicationsList({ page, limit: SAVED_LIMIT })
  const { isSaved } = useSavedPublications()
  const visibleData = data.filter((publication) => isSaved(publication._id))

  return (
    <main className="main-content">
      <h2 className="page-title">Publicaciones Guardadas</h2>
      <Link to="/profile" className="btn-back">
        ← Volver al Perfil
      </Link>

      {loading && <Loading label="Cargando guardados..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={reload} />}
      {!loading && !error && visibleData.length === 0 && (
        <EmptyState message="Todavía no guardaste ninguna publicación." />
      )}

      {!loading && !error && visibleData.length > 0 && (
        <>
          {visibleData.map((publication) => (
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
  )
}
