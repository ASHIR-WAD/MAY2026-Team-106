import { useState } from 'react'
import { useAuth } from '../context'
import { notificationsFixture, notificationRecipientsFixture } from '../lib/fixtures'

export function NotificationsPage() {
  const { user } = useAuth()
  const [recipients, setRecipients] = useState(notificationRecipientsFixture)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  if (!user) return null

  // Filter recipient mappings for the current user
  const userRecipients = recipients.filter((r) => r.recipient_id === user.user_id)

  const notifications = userRecipients
    .map((r) => {
      const detail = notificationsFixture.find((n) => n.id === r.notification_id)
      return {
        ...r,
        title: detail?.title || 'Notification',
        message: detail?.message || '',
        sent_at: detail?.sent_at || '',
        broadcast_type: detail?.broadcast_type || 'GENERAL',
      }
    })
    .filter((n) => (filter === 'unread' ? !n.read_at : true))
    .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())

  const markAsRead = (notificationId: number) => {
    setRecipients((prev) =>
      prev.map((r) =>
        r.notification_id === notificationId && r.recipient_id === user.user_id
          ? {
              ...r,
              read_at: new Date().toISOString(),
              hide_at: new Date().toISOString(),
            }
          : r
      )
    )
  }

  const markAllAsRead = () => {
    setRecipients((prev) =>
      prev.map((r) =>
        r.recipient_id === user.user_id
          ? {
              ...r,
              read_at: r.read_at || new Date().toISOString(),
              hide_at: r.hide_at || new Date().toISOString(),
            }
          : r
      )
    )
  }

  const getBroadcastTypeBadge = (type: string) => {
    switch (type) {
      case 'CRITICAL_UPDATE':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-danger/10 text-danger uppercase tracking-wider">
            Critical Update
          </span>
        )
      case 'EARLY_BIRD':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-success/10 text-success uppercase tracking-wider">
            Early Bird
          </span>
        )
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent/10 text-accent uppercase tracking-wider">
            Update
          </span>
        )
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface/50 backdrop-blur-md border border-border p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Keep track of latest announcements and critical event updates
          </p>
        </div>

        {userRecipients.some((r) => !r.read_at) && (
          <button
            onClick={markAllAsRead}
            className="self-start sm:self-center px-4 py-2 text-sm font-semibold rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors shadow-md shadow-accent/15"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="border border-border bg-surface rounded-2xl shadow-xl overflow-hidden">
        {/* Filters bar */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-alt/20">
          <div className="flex items-center gap-1.5 p-0.5 border border-border rounded-lg bg-surface/50">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filter === 'all'
                  ? 'bg-surface text-text-primary shadow-sm border border-border'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filter === 'unread'
                  ? 'bg-surface text-text-primary shadow-sm border border-border'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Unread
            </button>
          </div>

          <span className="text-xs text-text-secondary font-medium">
            Showing {notifications.length} item{notifications.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Notifications list */}
        <div className="divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.2}
                stroke="currentColor"
                className="w-12 h-12 text-text-secondary/50"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
              <p className="text-base font-semibold text-text-primary">
                No notifications to display
              </p>
              <p className="text-xs text-text-secondary max-w-sm">
                Any announcements or marathon critical updates will appear here when active.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.notification_id}
                className={`p-6 transition-all flex gap-4 ${
                  notif.read_at
                    ? 'opacity-70 hover:opacity-100 bg-surface'
                    : 'bg-accent/[0.02] hover:bg-accent/[0.04]'
                }`}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {getBroadcastTypeBadge(notif.broadcast_type)}
                    {!notif.read_at && (
                      <span className="h-2 w-2 rounded-full bg-accent" />
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-bold text-text-primary">
                      {notif.title}
                    </h3>

                    {!notif.read_at && (
                      <button
                        onClick={() => markAsRead(notif.notification_id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded border border-border bg-surface hover:bg-surface-alt transition-colors"
                        title="Mark as read"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                    {notif.message}
                  </p>

                  {notif.sent_at && (
                    <p className="text-xs text-text-secondary/60">
                      {new Date(notif.sent_at).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
export default NotificationsPage
