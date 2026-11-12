import type { NotificationType } from './domain'

export interface Notification {
  _id: string
  user_id: string
  type: NotificationType
  message: string
  read: boolean
  created_at: string
}
