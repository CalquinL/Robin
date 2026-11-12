import type { NeedStatus, PublicationStatus } from './domain'

export interface Need {
  _id: string
  name: string
  status: NeedStatus
}

export interface PublicationAuthor {
  name: string
  nick: string
  image: string
}

export interface Publication {
  _id: string
  user_id: string
  text: string
  file?: string
  status: PublicationStatus
  created_at: string
  necesidades: Need[]
  author?: PublicationAuthor
}

export interface CreatePublicationBody {
  text: string
  necesidades: { name: string }[]
}
