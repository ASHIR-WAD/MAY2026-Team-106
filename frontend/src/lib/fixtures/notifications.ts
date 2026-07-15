import type { Notifications } from '../../types/notifications'

export const notificationsFixture: Notifications[] = [
  {
    id: 1,
    event_id: 2,
    title: 'City Marathon starts today!',
    message: 'Reminder: bib pickup closes at 4:00 AM. Good luck out there!',
    broadcast_type: 'CRITICAL_UPDATE',
    sent_at: '2026-07-13T06:00:00Z',
  },
  {
    id: 2,
    event_id: 5,
    title: 'Rooftop Comedy Night has been cancelled',
    message: 'Unfortunately this event has been cancelled. Refunds are being processed.',
    broadcast_type: 'CRITICAL_UPDATE',
    sent_at: '2026-07-12T16:05:00Z',
  },
  {
    id: 3,
    event_id: 1,
    title: 'Early bird pricing ends soon',
    message: 'General tickets go up to ₹1299 after July 20th — grab yours now.',
    broadcast_type: 'EARLY_BIRD',
    sent_at: '2026-07-10T10:00:00Z',
  },
]
