import { useContext } from 'react'
import { SavedPublicationsContext } from '../context/SavedPublicationsContext'

export function useSavedPublications() {
  const ctx = useContext(SavedPublicationsContext)
  if (!ctx) {
    throw new Error('useSavedPublications debe usarse dentro de SavedPublicationsProvider')
  }
  return ctx
}
