import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context'

export function AvatarMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  if (!user) return null

  const handleEditProfile = () => {
    setIsOpen(false)
    const targetPath = user.role === 'ADMIN' ? '/user/update?tab=moderation' : '/user/update'
    navigate(targetPath, { replace: true })
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-purple-600 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-accent transition duration-200 transform hover:scale-105"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        {user.pfp_url ? (
          <img
            src={user.pfp_url}
            alt={user.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-surface shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-text-primary truncate">
              {user.name}
            </p>
            <p className="text-xs text-text-secondary truncate mt-0.5">
              {user.email}
            </p>
            <div className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/10 text-accent uppercase tracking-wider">
              {user.role}
            </div>
          </div>
          <div className="py-1 divide-y divide-border/50">
            {/* Edit Profile Link */}
            <button
              onClick={handleEditProfile}
              type="button"
              className="flex w-full items-center px-4 py-2.5 text-sm text-text-primary hover:bg-surface-alt transition-colors duration-150 text-left font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 mr-2 text-text-secondary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
              Edit Profile
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                setIsOpen(false)
                logout()
                // Clear all navigation state so the next login lands on the
                // role-based home, not the page we were just on.
                navigate('/auth/login', { replace: true, state: null })
              }}
              type="button"
              className="flex w-full items-center px-4 py-2.5 text-sm text-danger hover:bg-surface-alt transition-colors duration-150 text-left font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                />
              </svg>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
