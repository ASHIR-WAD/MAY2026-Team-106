import type { TicketTypes } from '../../types/ticket_types'

export const ticketTypesFixture: TicketTypes[] = [
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
    quantity_sold: 1, // Aligns perfectly with orderItems ID 2 quantity state
  },
]
