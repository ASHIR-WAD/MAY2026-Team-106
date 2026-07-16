import { createContext } from 'react'
import type { NotificationRecipients } from '../types/notification_recipients'
import type { Notifications } from '../types/notifications'

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
  userRecipients: NotificationRecipients[]
  visible: NotificationView[]
  unreadCount: number
  isEmpty: boolean
  dismiss: (notificationId: number) => void
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
)
