import { eventsFixture } from './events'
import { usersFixture } from './users'
import { interestTagsFixture } from './interestTags'
import { userInterestTagsFixture } from './userInterestTags'
import { userFollowsFixture } from './userFollows'
import { eventTagsFixture } from './eventTags'
import { mediaGalleryFixture } from './mediaGallery'
import { ticketTypesFixture } from './ticketTypes'
import { ordersFixture } from './orders'
import { orderItemsFixture } from './orderItems'
import { eventReviewsFixture } from './eventReviews'
import { notificationsFixture } from './notifications'
import { notificationRecipientsFixture } from './notificationRecipients'
import { platformModerationLogsFixture } from './platformModerationLogs'

/** In-memory GET path → fixture data (Module 3 stand-in). */
export const mockGetRoutes: Record<string, unknown> = {
  '/events': eventsFixture,
  '/users': usersFixture,
  '/interest-tags': interestTagsFixture,
  '/user-interest-tags': userInterestTagsFixture,
  '/user-follows': userFollowsFixture,
  '/event-tags': eventTagsFixture,
  '/media-gallery': mediaGalleryFixture,
  '/ticket-types': ticketTypesFixture,
  '/orders': ordersFixture,
  '/order-items': orderItemsFixture,
  '/event-reviews': eventReviewsFixture,
  '/notifications': notificationsFixture,
  '/notification-recipients': notificationRecipientsFixture,
  '/platform-moderation-logs': platformModerationLogsFixture,
}

/** In-memory POST path → fixture response factory. */
export const mockPostRoutes: Record<string, (body: unknown) => unknown> = {
  '/events': (body) => ({
    id: eventsFixture.length + 1,
    ...(typeof body === 'object' && body !== null ? body : {}),
  }),
  '/users': (body) => {
    const payload =
      typeof body === 'object' && body !== null
        ? (body as {
            email?: string
            role?: string
            name?: string
            phone?: string
            password?: string
          })
        : {}
    const newUser = {
      user_id: usersFixture.length + 1,
      email: payload.email || '',
      role: (payload.role === 'ORGANISER'
        ? 'ORGANISER'
        : payload.role === 'ADMIN'
          ? 'ADMIN'
          : 'ATTENDEE') as 'ATTENDEE' | 'ORGANISER' | 'ADMIN',
      name: payload.name || '',
      phone: payload.phone || '',
      password_hash: payload.password ? `$2b$mock-${payload.password}` : '$2b$mock-password',
      created_at: new Date().toISOString(),
      status: 'ACTIVE' as const,
      pfp_url: null,
      dob: null,
      description: null,
      bookmarks: [],
      docs: null,
    }
    usersFixture.push(newUser)
    return newUser
  },
}

export {
  eventsFixture,
  usersFixture,
  interestTagsFixture,
  userInterestTagsFixture,
  userFollowsFixture,
  eventTagsFixture,
  mediaGalleryFixture,
  ticketTypesFixture,
  ordersFixture,
  orderItemsFixture,
  eventReviewsFixture,
  notificationsFixture,
  notificationRecipientsFixture,
  platformModerationLogsFixture,
}
