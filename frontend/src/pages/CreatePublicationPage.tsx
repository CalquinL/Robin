import { useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { publicationsService } from '../services/publications'
import { getErrorMessage } from '../utils/errorMessages'
import './CreatePublicationPage.css'

interface FieldErrors {
  text?: string
  necesidades?: string
}

export function CreatePublicationPage() {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [needs, setNeeds] = useState<string[]>([''])
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateNeed(index: number, value: string) {
    setNeeds((prev) => prev.map((n, i) => (i === index ? value : n)))
  }

  function addNeed() {
    setNeeds((prev) => [...prev, ''])
  }

  function removeNeed(index: number) {
    setNeeds((prev) => prev.filter((_, i) => i !== index))
  }

  function validate(): { text: string; necesidades: { name: string }[] } | null {
    const errors: FieldErrors = {}
    const trimmedText = text.trim()
    const cleanedNeeds = needs.map((n) => n.trim()).filter((n) => n.length > 0)

    if (!trimmedText) errors.text = 'Cuenta tu historia para poder publicarla'
    if (cleanedNeeds.length === 0) errors.necesidades = 'Agrega al menos una necesidad'

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return null

    return { text: trimmedText, necesidades: cleanedNeeds.map((name) => ({ name })) }
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setFormError(null)
    const body = validate()
    if (!body) return

    setIsSubmitting(true)
    try {
      await publicationsService.create(body)
      navigate('/', { state: { publicationCreated: true } })
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="main-content">
      <h2 className="page-title">Nueva publicación</h2>

      <div className="card-box create-publication-card">
        {formError && <p className="form-banner-error">{formError}</p>}

        <form className="form-stack" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="pub-text">¿Qué necesidad quieres compartir hoy?</label>
            <textarea
              id="pub-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cuenta tu historia..."
              maxLength={2000}
            />
            {fieldErrors.text && <span className="form-error">{fieldErrors.text}</span>}
          </div>

          <div className="form-field">
            <label>Necesidades</label>
            <div className="needs-list">
              {needs.map((need, index) => (
                <div key={index} className="need-row">
                  <input
                    type="text"
                    value={need}
                    onChange={(e) => updateNeed(index, e.target.value)}
                    placeholder={`Necesidad ${index + 1}`}
                    aria-label={`Necesidad ${index + 1}`}
                    maxLength={100}
                  />
                  {needs.length > 1 && (
                    <button type="button" className="btn-remove-need" onClick={() => removeNeed(index)}>
                      Quitar
                    </button>
                  )}
                </div>
              ))}
            </div>
            {fieldErrors.necesidades && <span className="form-error">{fieldErrors.necesidades}</span>}
            <button type="button" className="btn-action btn-secondary" onClick={addNeed}>
              + Agregar necesidad
            </button>
          </div>

          <button type="submit" className="btn-action btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Publicando...' : 'Publicar'}
          </button>
        </form>
      </div>
    </main>
  )
}
