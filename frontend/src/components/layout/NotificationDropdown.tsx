import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../context'

function formatSentAt(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function NotificationDropdown() {
  const { visible, unreadCount, isEmpty, dismiss } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
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

  const handleItemClick = (notificationId: number) => {
    // Read-and-hide is a single action: populates both read_at and
    // hide_at in one update, per the Module 6 spec.
    dismiss(notificationId)
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
        className="relative p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Open notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
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
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-danger text-white text-[10px] font-bold leading-none ring-2 ring-surface">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[28rem] overflow-y-auto rounded-xl border border-border bg-surface shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          role="menu"
        >
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">
              Notifications
            </h3>
            <span className="text-[11px] text-text-secondary font-medium">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </span>
          </div>

          {isEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-10 text-center space-y-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.2}
                stroke="currentColor"
                className="w-10 h-10 text-text-secondary/40"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <p className="text-sm font-semibold text-text-primary">
                You're all caught up
              </p>
              <p className="text-xs text-text-secondary">
                New announcements will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {visible.map((n) => (
                <li key={n.notification_id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(n.notification_id)}
                    className="w-full text-left px-4 py-3 hover:bg-surface-alt transition-colors focus:outline-none focus:bg-surface-alt"
                    role="menuitem"
                  >
                    <div className="flex items-start gap-2">
                      {!n.read_at && (
                        <span
                          className="mt-1.5 h-2 w-2 rounded-full bg-accent flex-shrink-0"
                          aria-label="Unread"
                        />
                      )}
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {n.title}
                        </p>
                        <p className="text-xs text-text-secondary line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[11px] text-text-secondary/70">
                          {formatSentAt(n.sent_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="px-4 py-2 border-t border-border bg-surface-alt/30">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-xs font-semibold text-accent hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
