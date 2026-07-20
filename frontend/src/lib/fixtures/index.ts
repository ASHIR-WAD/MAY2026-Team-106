import { eventsFixture } from './events'
import type { EventStatus } from '../../types/events'
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
import type { Orders } from '../../types/orders'
import type { OrderItems } from '../../types/order_items'
import type { EventReviews } from '../../types/event_reviews'

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
      status: (payload.status as EventStatus | undefined) ?? 'PENDING_MODERATION',
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
  '/orders': (body) => {
  const payload = (typeof body === 'object' && body !== null ? body : {}) as Partial<Orders>
  const newOrder: Orders = {
    id: ordersFixture.length + 1,
    attendee_id: payload.attendee_id!,
    event_id: payload.event_id!,
    ticket_type_ids: null,
    total_amount: payload.total_amount ?? 0,
    payment_status: payload.payment_status ?? 'PENDING',
    payment_gateway_ref: null,
    created_at: new Date().toISOString(),
    access_code: payload.access_code ?? `GTH-ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  }
  ordersFixture.push(newOrder)
  return newOrder
},

'/order-items': (body) => {
  const payload = (typeof body === 'object' && body !== null ? body : {}) as Partial<OrderItems>
  const newItem: OrderItems = {
    id: orderItemsFixture.length + 1,
    order_id: payload.order_id!,
    ticket_type_id: payload.ticket_type_id!,
    quantity: payload.quantity ?? 0,
    unit_price: payload.unit_price ?? 0,
    subtotal: payload.subtotal ?? 0,
  }
  orderItemsFixture.push(newItem)
  return newItem
},

'/orders/update-status': (body) => {
  const { orderId, payment_status } = body as { orderId: number; payment_status: Orders['payment_status'] }
  const order = ordersFixture.find((o) => o.id === orderId)
  if (!order) throw new Error('Order not found')
  order.payment_status = payment_status
  return order
},

'/ticket-types/update-sold': (body) => {
  const { ticketTypeId, quantity } = body as { ticketTypeId: number; quantity: number }
  const tier = ticketTypesFixture.find((t) => t.id === ticketTypeId)
  if (!tier) throw new Error('Ticket type not found')
  tier.quantity_sold += quantity
  return tier
},'/event-reviews': (body) => {
  const payload = (typeof body === 'object' && body !== null ? body : {}) as Partial<EventReviews>
  const existing = eventReviewsFixture.find((r) => r.order_id === payload.order_id)

  if (existing) {
    // one review per order — update in place rather than duplicate
    existing.rating = payload.rating ?? existing.rating
    existing.comment = payload.comment ?? existing.comment
    return existing
  }

  const newReview: EventReviews = {
    id: eventReviewsFixture.length + 1,
    order_id: payload.order_id!,
    rating: payload.rating ?? 0,
    comment: payload.comment ?? null,
    created_at: new Date().toISOString(),
  }
  eventReviewsFixture.push(newReview)
  return newReview
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
