import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context'

interface RequireAuthProps {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return null
  }

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}
