import type { Orders } from '../../types/orders'

export const ordersFixture: Orders[] = [
  {
    id: 1,
    attendee_id: 1,
    event_id: 2,
    ticket_type_ids: [3],
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
    ticket_type_ids: [7],
    total_amount: 799,
    payment_status: 'SUCCESS',
    payment_gateway_ref: 'pay_rzp_1a2b3c',
    created_at: '2026-06-01T15:00:00Z',
    access_code: 'GTH-ORD-D4E5F6',
  },
  // Rhea (attendee_id 2): no orders — Your Bookings empty state
]
