import { useState, type SubmitEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../hooks/useAuth'
import { getErrorMessage } from '../utils/errorMessages'

interface LoginLocationState {
  registered?: boolean
}

interface FieldErrors {
  email?: string
  password?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const registered = Boolean((location.state as LoginLocationState | null)?.registered)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  function validate(): boolean {
    const errors: FieldErrors = {}
    if (!email.trim()) errors.email = 'El correo es obligatorio'
    else if (!EMAIL_PATTERN.test(email)) errors.email = 'Ingresa un correo válido'
    if (!password) errors.password = 'La contraseña es obligatoria'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="auth-title">Iniciar sesión</h1>

      {registered && <p className="form-banner-success">Tu cuenta fue creada. Ahora inicia sesión.</p>}
      {formError && <p className="form-banner-error">{formError}</p>}

      <form className="form-stack" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="login-email">Correo</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            maxLength={100}
          />
          {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            maxLength={72}
          />
          {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}
        </div>

        <button type="submit" className="btn-action btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="auth-footer">
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </AuthLayout>
  )
}
