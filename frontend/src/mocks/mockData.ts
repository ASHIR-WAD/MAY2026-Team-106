/**
 * src/lib/mockData.ts
 *
 * Rebuilt for the finalized schema. Major structural changes from the
 * previous version:
 *  - attendee_profiles + organiser_profiles are gone. Everyone is one row
 *    in `users`, distinguished by `role`.
 *  - event_imp_info is gone. "Things to know" now lives inline on the
 *    event as `imp_info: string[]`.
 *  - registrations_and_tickets is gone, replaced by `orders` (one row per
 *    checkout, carrying the single access_code for that whole booking) and
 *    `order_items` (one row per ticket tier within that order, with a
 *    quantity — not one row per physical ticket anymore).
 *  - media_gallery is now keyed by event_id, not organiser_id.
 *  - attendee_bookmarks, organiser_tags, and event_collaborators are all
 *    gone — there is no fixture data for them because the tables don't
 *    exist anymore.
 *  - notifications no longer has sender_id.
 *  - notification_recipients gained hide_at alongside read_at.
 *  - event_reviews is now keyed by order_id (one review per order).
 *
 * EDGE CASES (kept consistent with earlier fixtures where possible):
 *  - Rhea (user_id 2): no interests, no follows, no orders — tests every
 *    empty state.
 *  - Event 4 (Startup Pitch Night): imp_info is an empty array, and has no
 *    media_gallery rows — tests both empty states on one event.
 *  - Ticket type id 4 (VIP Finisher Pack, event 2): sold out.
 *  - Event 5 (Rooftop Comedy Night): CANCELLED.
 *  - Event 6 (Winter Jazz Evening): in the past, already reviewed via its
 *    order (order id 2).
 *  - Event 2 (City Marathon): "ongoing" relative to now (2026-07-13).
 *  - Notification id 2: already read AND hidden, to test that the unread
 *    filter/badge correctly excludes it.
 */

// ---------- interest_tags ----------
export const interestTags = [
  { id: 1, tag_name: 'Music' },
  { id: 2, tag_name: 'Tech' },
  { id: 3, tag_name: 'Comedy' },
  { id: 4, tag_name: 'Sports' },
  { id: 5, tag_name: 'Food' },
];

// ---------- users (merged attendee + organiser profile fields) ----------
export const users = [
  {
    user_id: 1,
    email: 'arjun.k@example.com',
    password_hash: '$2b$hashA',
    role: 'ATTENDEE',
    name: 'Arjun Kumar',
    phone: '9876543210',
    created_at: '2026-05-01T10:00:00Z',
    status: 'ACTIVE',
    pfp_url: 'https://picsum.photos/seed/arjun/200',
    dob: '1998-03-14',
    description: null,
  },
  {
    // Rhea: fresh account, onboarding skipped, no activity yet
    user_id: 2,
    email: 'rhea.s@example.com',
    password_hash: '$2b$hashB',
    role: 'ATTENDEE',
    name: 'Rhea Sharma',
    phone: '9876500000',
    created_at: '2026-07-10T09:00:00Z',
    status: 'ACTIVE',
    pfp_url: '',
    dob: '2001-11-02',
    description: null,
  },
  {
    user_id: 3,
    email: 'events@beatworks.io',
    password_hash: '$2b$hashC',
    role: 'ORGANISER',
    name: 'Beatworks Events',
    phone: '9811100001',
    created_at: '2026-01-15T08:00:00Z',
    status: 'ACTIVE',
    pfp_url: 'https://picsum.photos/seed/beatworks/200',
    dob: null,
    description: 'We run live music and nightlife experiences across Gurugram.',
  },
  {
    user_id: 4,
    email: 'hello@runclubgurugram.com',
    password_hash: '$2b$hashD',
    role: 'ORGANISER',
    name: 'RunClub Gurugram',
    phone: '9811100002',
    created_at: '2026-02-20T08:00:00Z',
    status: 'ACTIVE',
    pfp_url: 'https://picsum.photos/seed/runclub/200',
    dob: null,
    description: 'Community running events, marathons, and fitness meetups.',
  },
  {
    // pending approval — should not be bookable/visible in public listings yet
    user_id: 5,
    email: 'bookings@laughtrack.co',
    password_hash: '$2b$hashE',
    role: 'ORGANISER',
    name: 'LaughTrack Co.',
    phone: '9811100003',
    created_at: '2026-07-05T08:00:00Z',
    status: 'SUSPENDED',
    pfp_url: 'https://picsum.photos/seed/laughtrack/200',
    dob: null,
    description: 'Stand-up comedy nights, new and touring acts.',
  },
  {
    // admin — no meaningful profile fields beyond role
    user_id: 6,
    email: 'admin@gatherly.app',
    password_hash: '$2b$hashF',
    role: 'ADMIN',
    name: 'Platform Admin',
    phone: null,
    created_at: '2026-01-01T00:00:00Z',
    status: 'ACTIVE',
    pfp_url: '',
    dob: null,
    description: null,
  },
];

// ---------- user_interest_tags ----------
export const userInterestTags = [
  { user_id: 1, tag_id: 1 }, // Arjun likes Music
  { user_id: 1, tag_id: 3 }, // and Comedy
  // Rhea (user_id 2): none — tests empty "might like" ranking
];

// ---------- user_follows (generalized follower/following, not organiser-specific) ----------
export const userFollows = [
  { follower_id: 1, following_id: 3, followed_at: '2026-05-10T12:00:00Z' }, // Arjun follows Beatworks
  // Rhea follows nobody
];

// ---------- events ----------
export const events = [
  {
    id: 1,
    organiser_id: 3,
    title: 'Summer Beats Festival',
    description: 'An open-air music festival featuring local and touring DJs.',
    imp_info: [
      'Gates open at 5:00 PM, entry closes at 8:00 PM.',
      'Outside food and drinks are not permitted.',
      'Valid government ID required at entry.',
    ],
    venue: 'Aravalli Grounds, Gurugram',
    capacity_limit: 2000,
    registration_deadline: '2026-08-01T23:59:00Z',
    start_time: '2026-08-05T18:00:00Z',
    end_time: '2026-08-05T23:30:00Z',
    age_limit: 18,
    banner_url: 'https://picsum.photos/seed/event1/800/400',
    pfp_url: 'https://picsum.photos/seed/event1icon/100',
    status: 'ACTIVE',
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
    terms_url: 'https://example.com/terms/event1',
  },
    {
    // ONGOING relative to live date (2026-07-14)
    id: 2,
    organiser_id: [4],
    title: 'City Marathon',
    description: 'A 21km run through the city, open to all skill levels.',
    imp_info: [
      'Bib pickup is available the day before at the venue.',
      'Water stations are placed every 3km.',
    ],
    venue: 'Cyber Hub, Gurugram',
    capacity_limit: 5000,
    registration_deadline: '2026-07-13T23:59:00Z',
    start_time: '2026-07-14T05:00:00Z',  // Shifted forward by 1 day
    end_time: '2026-07-14T22:00:00Z',    // Shifted forward to stay active today
    age_limit: 16,
    banner_url: 'https://picsum.photos',
    pfp_url: 'https://picsum.photos',
    status: 'ACTIVE',
    created_at: '2026-05-15T10:00:00Z',
    updated_at: '2026-07-11T09:00:00Z',
    terms_url: 'https://example.com',
  },
  {
    id: 3,
    organiser_id: 3,
    title: 'Acoustic Sessions',
    description: 'An intimate evening of unplugged live performances.',
    imp_info: ['Seating is first-come, first-served.'],
    venue: 'The Piano Man, Gurugram',
    capacity_limit: 150,
    registration_deadline: '2026-07-25T23:59:00Z',
    start_time: '2026-07-28T19:00:00Z',
    end_time: '2026-07-28T22:00:00Z',
    age_limit: null,
    banner_url: 'https://picsum.photos/seed/event3/800/400',
    pfp_url: 'https://picsum.photos/seed/event3icon/100',
    status: 'ACTIVE',
    created_at: '2026-06-20T10:00:00Z',
    updated_at: '2026-06-20T10:00:00Z',
    terms_url: 'https://example.com/terms/event3',
  },
  {
    // empty imp_info + empty gallery — deliberate edge case
    id: 4,
    organiser_id: 3,
    title: 'Startup Pitch Night',
    description: 'Founders pitch live to a room of investors and builders.',
    imp_info: [],
    venue: 'WeWork Galaxy, Gurugram',
    capacity_limit: 200,
    registration_deadline: '2026-07-20T23:59:00Z',
    start_time: '2026-07-22T18:00:00Z',
    end_time: '2026-07-22T21:00:00Z',
    age_limit: null,
    banner_url: 'https://picsum.photos/seed/event4/800/400',
    pfp_url: 'https://picsum.photos/seed/event4icon/100',
    status: 'ACTIVE',
    created_at: '2026-06-25T10:00:00Z',
    updated_at: '2026-06-25T10:00:00Z',
    terms_url: 'https://example.com/terms/event4',
  },
  {
    // CANCELLED
    id: 5,
    organiser_id: 5,
    title: 'Rooftop Comedy Night',
    description: 'Stand-up under the stars with three touring comedians.',
    imp_info: ['Doors open at 7:30 PM.'],
    venue: 'Sky Lounge, Gurugram',
    capacity_limit: 120,
    registration_deadline: '2026-07-18T23:59:00Z',
    start_time: '2026-07-20T20:00:00Z',
    end_time: '2026-07-20T22:30:00Z',
    age_limit: 18,
    banner_url: 'https://picsum.photos/seed/event5/800/400',
    pfp_url: 'https://picsum.photos/seed/event5icon/100',
    status: 'CANCELLED',
    created_at: '2026-06-15T10:00:00Z',
    updated_at: '2026-07-12T16:00:00Z',
    terms_url: 'https://example.com/terms/event5',
  },
  {
    // PAST event — used for Your Bookings "past" + rating flow
    id: 6,
    organiser_id: 3,
    title: 'Winter Jazz Evening',
    description: 'A cozy night of jazz standards and original compositions.',
    imp_info: ['Doors open 30 minutes before showtime.'],
    venue: 'The Piano Man, Gurugram',
    capacity_limit: 150,
    registration_deadline: '2026-06-08T23:59:00Z',
    start_time: '2026-06-10T19:00:00Z',
    end_time: '2026-06-10T22:00:00Z',
    age_limit: null,
    banner_url: 'https://picsum.photos/seed/event6/800/400',
    pfp_url: 'https://picsum.photos/seed/event6icon/100',
    status: 'ACTIVE',
    created_at: '2026-05-01T10:00:00Z',
    updated_at: '2026-05-01T10:00:00Z',
    terms_url: 'https://example.com/terms/event6',
  },
];

// ---------- event_tags ----------
export const eventTags = [
  { event_id: 1, tag_id: 1 },
  { event_id: 2, tag_id: 4 },
  { event_id: 3, tag_id: 1 },
  { event_id: 4, tag_id: 2 },
  { event_id: 5, tag_id: 3 },
  { event_id: 6, tag_id: 1 },
];

// ---------- media_gallery (now event-scoped, not organiser-scoped) ----------
export const mediaGallery = [
  { id: 1, event_id: 1, image_url: 'https://picsum.photos/seed/gal1/400' },
  { id: 2, event_id: 1, image_url: 'https://picsum.photos/seed/gal2/400' },
  { id: 3, event_id: 3, image_url: 'https://picsum.photos/seed/gal3/400' },
  // event_id 4 (Startup Pitch Night): no gallery rows — empty state
];

// ---------- ticket_types ----------
export const ticketTypes = [
  { id: 1, event_id: 1, name: 'General', price: 999, quantity_total: 1500, quantity_sold: 620 },
  { id: 2, event_id: 1, name: 'VIP', price: 2499, quantity_total: 200, quantity_sold: 180 },
  { id: 3, event_id: 2, name: 'Runner Entry', price: 499, quantity_total: 4000, quantity_sold: 3120 },
  {
    // SOLD OUT
    id: 4,
    event_id: 2,
    name: 'VIP Finisher Pack',
    price: 1299,
    quantity_total: 100,
    quantity_sold: 100,
  },
  { id: 5, event_id: 3, name: 'Standard', price: 599, quantity_total: 150, quantity_sold: 40 },
  { id: 6, event_id: 4, name: 'Free RSVP', price: 0, quantity_total: 200, quantity_sold: 95 },
  { 
    id: 7, 
    event_id: 6, 
    name: 'Standard', 
    price: 799, 
    quantity_total: 150, 
    quantity_sold: 1 // Aligns perfectly with orderItems ID 2 quantity state
  },
];

// ---------- orders (one row per checkout; access_code covers the whole order) ----------
export const orders = [
  {
    id: 1,
    attendee_id: 1,
    event_id: 2,
    total_amount: 998,
    payment_status: 'SUCCESS',
    payment_gateway_ref: 'pay_rzp_9f8e7d',
    created_at: '2026-07-05T11:20:00Z',
    access_code: 'GTH-ORD-A1B2C3',
  },
  {
    id: 2,
    attendee_id: 1,
    event_id: 6,
    total_amount: 799,
    payment_status: 'SUCCESS',
    payment_gateway_ref: 'pay_rzp_1a2b3c',
    created_at: '2026-06-01T15:00:00Z',
    access_code: 'GTH-ORD-D4E5F6',
  },

  // Rhea (attendee_id 2): no orders — Your Bookings empty state
];

// ---------- order_items (line items within an order — one row per tier, with quantity) ----------
export const orderItems = [
  { id: 1, order_id: 1, ticket_type_id: 3, quantity: 2, unit_price: 499, subtotal: 998 },
  { id: 2, order_id: 2, ticket_type_id: 7, quantity: 1, unit_price: 799, subtotal: 799 },
];

// ---------- event_reviews (now keyed by order_id, one review per order) ----------
export const eventReviews = [
  {
    id: 1,
    order_id: 2, // the Winter Jazz Evening order
    rating: 5,
    comment: 'Fantastic sound and a really intimate setting. Would go again.',
    created_at: '2026-06-11T09:00:00Z',
  },
];

// ---------- notifications (no sender_id anymore) ----------
export const notifications = [
  {
    id: 1,
    event_id: 2,
    title: 'City Marathon starts today!',
    message: 'Reminder: bib pickup closes at 4:00 AM. Good luck out there!',
    broadcast_type: 'REMINDER',
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
];

// ---------- notification_recipients (read_at AND hide_at) ----------
export const notificationRecipients = [
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
];

// ---------- platform_moderation_logs ----------
export const platformModerationLogs = [
  {
    id: 1,
    admin_id: 6, // references the ADMIN row in the merged users table
    event_id: 5,
    action_taken: 'FLAGGED',
    reason: 'Organiser requested cancellation due to venue unavailability.',
    logged_at: '2026-07-12T15:50:00Z',
  },
];
