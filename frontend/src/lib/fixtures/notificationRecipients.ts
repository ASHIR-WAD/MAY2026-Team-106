import type { NotificationRecipients } from '../../types/notification_recipients'

export const notificationRecipientsFixture: NotificationRecipients[] = [
  { notification_id: 1, recipient_id: 1, read_at: null, hide_at: null }, // unread
  {
    // already read AND hidden — marking read hides it, per the "disappears
    // when read" requirement (see Module 15 for the reasoning)
    notification_id: 2,
    recipient_id: 1,
    read_at: '2026-07-12T18:30:00Z',
    hide_at: '2026-07-12T18:30:00Z',
  },
  { notification_id: 3, recipient_id: 1, read_at: null, hide_at: null }, // unread
  // Rhea (recipient_id 2): no notifications — bell badge should show 0
]
