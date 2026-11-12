import { useState, type SubmitEvent } from 'react'
import { usersService } from '../services/users'
import { getErrorMessage } from '../utils/errorMessages'

interface FieldErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate(): boolean {
    const errors: FieldErrors = {}
    if (!currentPassword) errors.currentPassword = 'Ingresa tu contraseña actual'
    if (!newPassword) errors.newPassword = 'Ingresa la contraseña nueva'
    if (newPassword && confirmPassword !== newPassword) errors.confirmPassword = 'Las contraseñas no coinciden'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setFormError(null)
    setFormSuccess(false)
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await usersService.changePassword({ current_password: currentPassword, new_password: newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setFormSuccess(true)
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card-box profile-details-card">
      <h3 className="card-title">Cambiar Contraseña</h3>

      {formSuccess && <p className="form-banner-success">Tu contraseña se actualizó.</p>}
      {formError && <p className="form-banner-error">{formError}</p>}

      <form className="form-stack" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="current-password">Contraseña actual</label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            maxLength={72}
          />
          {fieldErrors.currentPassword && <span className="form-error">{fieldErrors.currentPassword}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="new-password">Contraseña nueva</label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            maxLength={72}
          />
          {fieldErrors.newPassword && <span className="form-error">{fieldErrors.newPassword}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="confirm-password">Confirmar contraseña nueva</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            maxLength={72}
          />
          {fieldErrors.confirmPassword && <span className="form-error">{fieldErrors.confirmPassword}</span>}
        </div>

        <button type="submit" className="btn-action btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Cambiando...' : 'Cambiar Contraseña'}
        </button>
      </form>
    </div>
  )
}
