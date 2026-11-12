import { useState, type SubmitEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../hooks/useAuth'
import type { RegisterableRole, RegisterBody } from '../types/user'
import { getErrorMessage } from '../utils/errorMessages'

type FormState = {
  name: string
  surname: string
  nick: string
  email: string
  password: string
  role: RegisterableRole
}

const INITIAL_FORM: FormState = {
  name: '',
  surname: '',
  nick: '',
  email: '',
  password: '',
  role: 'donante',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) errors.name = 'El nombre es obligatorio'
    if (!form.surname.trim()) errors.surname = 'El apellido es obligatorio'
    if (!form.nick.trim()) errors.nick = 'El apodo es obligatorio'
    if (!form.email.trim()) errors.email = 'El correo es obligatorio'
    else if (!EMAIL_PATTERN.test(form.email)) errors.email = 'Ingresa un correo válido'
    if (!form.password) errors.password = 'La contraseña es obligatoria'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const body: RegisterBody = { ...form }
      await register(body)
      navigate('/login', { state: { registered: true } })
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="auth-title">Crear cuenta</h1>

      {formError && <p className="form-banner-error">{formError}</p>}

      <form className="form-stack" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="register-name">Nombre</label>
          <input
            id="register-name"
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            autoComplete="given-name"
            maxLength={50}
          />
          {fieldErrors.name && <span className="form-error">{fieldErrors.name}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="register-surname">Apellido</label>
          <input
            id="register-surname"
            type="text"
            value={form.surname}
            onChange={(e) => updateField('surname', e.target.value)}
            autoComplete="family-name"
            maxLength={50}
          />
          {fieldErrors.surname && <span className="form-error">{fieldErrors.surname}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="register-nick">Apodo</label>
          <input
            id="register-nick"
            type="text"
            value={form.nick}
            onChange={(e) => updateField('nick', e.target.value)}
            autoComplete="username"
            maxLength={30}
          />
          {fieldErrors.nick && <span className="form-error">{fieldErrors.nick}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="register-email">Correo</label>
          <input
            id="register-email"
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            autoComplete="email"
            maxLength={100}
          />
          {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="register-password">Contraseña</label>
          <input
            id="register-password"
            type="password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            autoComplete="new-password"
            maxLength={72}
          />
          {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="register-role">Quiero</label>
          <select
            id="register-role"
            value={form.role}
            onChange={(e) => updateField('role', e.target.value as RegisterableRole)}
          >
            <option value="donante">Donar</option>
            <option value="beneficiario">Recibir ayuda</option>
          </select>
        </div>

        <button type="submit" className="btn-action btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="auth-footer">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </AuthLayout>
  )
}
