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
  '/events': (body) => {
    const payload =
      typeof body === 'object' && body !== null
        ? (body as Record<string, unknown>)
        : {}
    const created = {
      id: eventsFixture.length + 1,
      organiser_id: (payload.organiser_id as number[] | undefined) ?? [],
      title: (payload.title as string | undefined) ?? '',
      description: (payload.description as string | null | undefined) ?? null,
      imp_info: (payload.imp_info as string[] | null | undefined) ?? null,
      venue: (payload.venue as string | undefined) ?? '',
      capacity_limit: (payload.capacity_limit as number | undefined) ?? 0,
      registration_deadline:
        (payload.registration_deadline as string | undefined) ??
        new Date().toISOString(),
      start_time:
        (payload.start_time as string | undefined) ?? new Date().toISOString(),
      end_time:
        (payload.end_time as string | undefined) ?? new Date().toISOString(),
      age_limit: (payload.age_limit as number | null | undefined) ?? null,
      banner_url: (payload.banner_url as string | null | undefined) ?? null,
      pfp_url: (payload.pfp_url as string | null | undefined) ?? null,
      status: (payload.status as string | undefined) ?? 'PENDING_MODERATION',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      terms_url: (payload.terms_url as string | null | undefined) ?? null,
    }
    eventsFixture.push(created)
    return created
  },
  '/ticket-types': (body) => {
    const payload =
      typeof body === 'object' && body !== null
        ? (body as Record<string, unknown>)
        : {}
    const created = {
      id: ticketTypesFixture.length + 1,
      event_id: (payload.event_id as number | undefined) ?? 0,
      name: (payload.name as string | undefined) ?? '',
      price: (payload.price as number | undefined) ?? 0,
      quantity_total: (payload.quantity_total as number | undefined) ?? 0,
      quantity_sold: (payload.quantity_sold as number | undefined) ?? 0,
    }
    ticketTypesFixture.push(created)
    return created
  },
  '/media-gallery': (body) => {
    const payload =
      typeof body === 'object' && body !== null
        ? (body as Record<string, unknown>)
        : {}
    const created = {
      id: mediaGalleryFixture.length + 1,
      event_id: (payload.event_id as number | undefined) ?? 0,
      image_url: (payload.image_url as string | undefined) ?? '',
    }
    mediaGalleryFixture.push(created)
    return created
  },
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
  '/users/me/bookmarks': (body) => {
    // Bookmark persistence is handled optimistically in the client via
    // updateProfile() — the local React state and localStorage are the
    // source of truth. This mock just acknowledges the request so the
    // catch block in useBookmark doesn't roll the UI back.
    return { ok: true, ...(typeof body === 'object' && body !== null ? body : {}) }
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

// Devtools inspection helper. In the browser console:
//   __fixtures__.events            → all events (incl. ones you created)
//   __fixtures__.tickets           → all ticket types
//   __fixtures__.media             → all media gallery rows
//   __fixtures__.users             → all users
//   __fixtures__.<table>           → every other table listed above
// Only attached in development to avoid leaking fixtures in prod bundles.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(window as unknown as { __fixtures__: Record<string, unknown> }).__fixtures__ = {
    events: eventsFixture,
    users: usersFixture,
    interestTags: interestTagsFixture,
    userInterestTags: userInterestTagsFixture,
    userFollows: userFollowsFixture,
    eventTags: eventTagsFixture,
    media: mediaGalleryFixture,
    tickets: ticketTypesFixture,
    orders: ordersFixture,
    orderItems: orderItemsFixture,
    eventReviews: eventReviewsFixture,
    notifications: notificationsFixture,
    notificationRecipients: notificationRecipientsFixture,
    platformModerationLogs: platformModerationLogsFixture,
  }
}
