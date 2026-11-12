import { createContext } from 'react'

export interface SavedPublicationsContextValue {
  savedIds: Set<string>
  isSaved: (publicationId: string) => boolean
  toggleSave: (publicationId: string) => Promise<void>
  pendingId: string | null
}

export const SavedPublicationsContext = createContext<SavedPublicationsContextValue | null>(null)
