import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context'
import { Navbar } from './Navbar'

export function AuthenticatedShell() {
  const { user, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-text-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-sm font-medium text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  const { pathname } = location

  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/event/') ||
    pathname.startsWith('/organiser/')

  if (!user && !isPublicRoute) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  // Guard for /org/* routes
  if (pathname.startsWith('/org')) {
    if (!user || user.role !== 'ORGANISER') {
      return <Navigate to="/" replace />
    }
  }

  // Guard for /admin/* routes
  if (pathname.startsWith('/admin')) {
    if (!user || user.role !== 'ADMIN') {
      return <Navigate to="/" replace />
    }
  }

  // Redirect role-specific home pages if landing on '/'
  if (user && pathname === '/') {
    if (user.role === 'ORGANISER') {
      return <Navigate to="/org" replace />
    }
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary transition-colors duration-200">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
