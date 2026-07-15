import { createContext } from 'react'
import type { Users, UserRole } from '../types/users'

export interface SignupInput {
  email: string
  password: string
  name: string
  phone: string
  role: UserRole
}

export interface AuthContextValue {
  user: Users | null
  token: string | null
  isInitializing: boolean
  login: (email: string, password: string) => Promise<Users>
  logout: () => void
  signup: (input: SignupInput) => Promise<Users>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
