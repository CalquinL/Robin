import type { Role } from './domain'

export interface User {
  _id: string
  name: string
  surname: string
  nick: string
  email: string
  role: Role
  image: string
  address?: string
  phone?: string
  verified: boolean
  created_at: string
}

export interface AuthUser {
  id: string
  name: string
  nick: string
  role: Role
}

export type RegisterableRole = Exclude<Role, 'admin'>

export interface RegisterBody {
  name: string
  surname: string
  nick: string
  email: string
  password: string
  role: RegisterableRole
}

export interface UpdateProfileBody {
  name?: string
  surname?: string
  nick?: string
  address?: string
  phone?: string
}

export interface ChangePasswordBody {
  current_password: string
  new_password: string
}
