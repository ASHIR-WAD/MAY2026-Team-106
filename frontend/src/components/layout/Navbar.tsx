import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context'
import { NavTabs } from './NavTabs'
import { ThemeToggle } from './ThemeToggle'
import { AvatarMenu } from './AvatarMenu'
import { NotificationDropdown } from './NotificationDropdown'

export function Navbar() {
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const homeRoute =
    user
      ? user.role === 'ADMIN'
        ? '/admin'
        : user.role === 'ORGANISER'
          ? '/org'
          : '/'
      : '/'

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
                {/* Bell Icon with badge + dropdown (Module 6) — only for non-admins */}
                {user.role !== 'ADMIN' && <NotificationDropdown />}

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
