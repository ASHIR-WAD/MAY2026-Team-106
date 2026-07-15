import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context'
import { NavTabs } from './NavTabs'
import { ThemeToggle } from './ThemeToggle'
import { AvatarMenu } from './AvatarMenu'
import { notificationRecipientsFixture } from '../../lib/fixtures'

export function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const homeRoute =
    user
      ? user.role === 'ADMIN'
        ? '/admin'
        : user.role === 'ORGANISER'
          ? '/org'
          : '/'
      : '/'

  // Calculate unread count to show/hide the red dot on the bell icon
  const unreadCount = user
    ? notificationRecipientsFixture.filter(
        (r) => r.recipient_id === user.user_id && !r.read_at
      ).length
    : 0

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/65 backdrop-blur-xl transition-all duration-300 shadow-[0_2px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.15)] border-b border-white/[0.04] dark:border-white/[0.01]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to={homeRoute}
              className="flex items-center gap-2 group focus:outline-none"
            >
              <span className="text-xl font-bold bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent group-hover:opacity-95 transition-opacity">
                Gatherly
              </span>
            </Link>
          </div>

          {/* Desktop NavTabs - Only shown if logged in */}
          {user && (
            <div className="hidden md:flex md:items-center md:h-full">
              <NavTabs layout="horizontal" />
            </div>
          )}

          {/* Action buttons & Avatar */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {user ? (
              <>
                {/* Bell Icon - Only show if not ADMIN. Clicking redirects directly to notifications page */}
                {user.role !== 'ADMIN' && (
                  <div>
                    <button
                      onClick={() => navigate('/notifications')}
                      type="button"
                      className="relative p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
                      aria-label="Go to notifications page"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                        />
                      </svg>
                      {/* Red dot indicator */}
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
                      )}
                    </button>
                  </div>
                )}

                {/* Avatar Dropdown */}
                <AvatarMenu />

                {/* Hamburger button */}
                <button
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-accent md:hidden transition-colors duration-200"
                  aria-controls="mobile-menu"
                  aria-expanded={isMobileMenuOpen}
                  aria-label="Toggle main menu"
                >
                  {isMobileMenuOpen ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                      />
                    </svg>
                  )}
                </button>
              </>
            ) : (
              // Guest Mode Login/Signup buttons
              <div className="flex items-center gap-2">
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/auth/signup"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 transition-all duration-150 transform active:scale-95 shadow-md shadow-accent/25"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Mobile Menu - Only shown if logged in */}
      {user && (
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-border bg-surface ${
            isMobileMenuOpen ? 'max-h-60 opacity-100 py-3' : 'max-h-0 opacity-0'
          }`}
          id="mobile-menu"
        >
          <NavTabs
            layout="vertical"
            onTabClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
      )}
    </header>
  )
}
