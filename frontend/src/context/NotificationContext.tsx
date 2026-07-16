import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './useAuth'
import { notificationRecipientsFixture } from '../lib/fixtures/notificationRecipients'
import { notificationsFixture } from '../lib/fixtures/notifications'
import type { NotificationRecipients } from '../types/notification_recipients'
import type { Notifications } from '../types/notifications'

/**
 * Combined view-model that pairs a recipient-row with the underlying
 * notification payload. Used by the bell dropdown and the full page.
 */
export interface NotificationView {
  notification_id: number
  recipient_id: number
  read_at: string | null
  hide_at: string | null
  title: string
  message: string
  sent_at: string
  broadcast_type: Notifications['broadcast_type']
}

export interface NotificationContextValue {
  /** All rows for the current user, regardless of read/hide state. */
  userRecipients: NotificationRecipients[]
  /** Currently visible rows (hide_at IS NULL), used by the dropdown. */
  visible: NotificationView[]
  /** Badge count: rows for this user where read_at IS NULL. */
  unreadCount: number
  /** True when nothing is visible in the dropdown right now. */
  isEmpty: boolean
  /**
   * Mark one notification as both read and hidden in a single update.
   * Reading and hiding are the same action per the "disappears once read"
   * requirement, mapped onto the two-field schema.
   */
  dismiss: (notificationId: number) => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
)

function buildView(
  row: NotificationRecipients,
  detail: Notifications | undefined,
): NotificationView {
  return {
    notification_id: row.notification_id,
    recipient_id: row.recipient_id,
    read_at: row.read_at,
    hide_at: row.hide_at,
    title: detail?.title ?? 'Notification',
    message: detail?.message ?? '',
    sent_at: detail?.sent_at ?? '',
    broadcast_type: detail?.broadcast_type ?? null,
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  // Seeded from the fixture; this is the in-memory mock state that both
  // the bell dropdown and the full Notifications page read from. Keeping
  // it here means clicking a bell item and a page item both update the
  // same source of truth.
  const [recipients, setRecipients] = useState<NotificationRecipients[]>(
    () => notificationRecipientsFixture.map((r) => ({ ...r })),
  )

  // When the user changes (login / logout / switch), reseed from the
  // fixture so two users in the same session both see the right starting
  // state. Rhea, for example, has zero rows; Arjun has three.
  useEffect(() => {
    setRecipients(notificationRecipientsFixture.map((r) => ({ ...r })))
  }, [user?.user_id])

  const userRecipients = useMemo(() => {
    if (!user) return []
    return recipients.filter((r) => r.recipient_id === user.user_id)
  }, [recipients, user])

  const visible = useMemo<NotificationView[]>(() => {
    return userRecipients
      .filter((r) => r.hide_at === null)
      .map((r) =>
        buildView(
          r,
          notificationsFixture.find((n) => n.id === r.notification_id),
        ),
      )
      .sort(
        (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime(),
      )
  }, [userRecipients])

  const unreadCount = useMemo(
    () => userRecipients.filter((r) => r.read_at === null).length,
    [userRecipients],
  )

  const dismiss = useCallback(
    (notificationId: number) => {
      if (!user) return
      const now = new Date().toISOString()
      setRecipients((prev) =>
        prev.map((r) =>
          r.notification_id === notificationId && r.recipient_id === user.user_id
            ? { ...r, read_at: now, hide_at: now }
            : r,
        ),
      )
    },
    [user],
  )

  const value = useMemo<NotificationContextValue>(
    () => ({
      userRecipients,
      visible,
      unreadCount,
      isEmpty: visible.length === 0,
      dismiss,
    }),
    [userRecipients, visible, unreadCount, dismiss],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error(
      'useNotifications must be used within a <NotificationProvider>',
    )
  }
  return ctx
}
