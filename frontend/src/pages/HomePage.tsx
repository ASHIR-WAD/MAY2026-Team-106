import { Link } from 'react-router-dom'
import { useAuth } from '../context'

export function HomePage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      {/* Visual background gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl space-y-6 relative z-10">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary">
          Discover and Host{' '}
          <span className="bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
            Unforgettable Events
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto font-medium">
          Gatherly brings creators, organisers, and attendees together. Explore live music, tech conferences, local run clubs, and stand-up comedy nights.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
          {user ? (
            <Link
              to={user.role === 'ORGANISER' ? '/org' : user.role === 'ADMIN' ? '/admin' : '/user/bookings'}
              className="rounded-lg bg-accent px-6 py-3 font-semibold text-white hover:bg-accent/90 transition-all duration-150 transform active:scale-95 shadow-lg shadow-accent/25"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth/signup"
                className="rounded-lg bg-accent px-6 py-3 font-semibold text-white hover:bg-accent/90 transition-all duration-150 transform active:scale-95 shadow-lg shadow-accent/25"
              >
                Get Started
              </Link>
              <Link
                to="/auth/login"
                className="rounded-lg border border-border bg-surface px-6 py-3 font-semibold text-text-primary hover:bg-surface-alt transition-colors duration-150"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
