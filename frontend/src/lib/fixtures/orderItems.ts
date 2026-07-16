import type { OrderItems } from '../../types/order_items'

export const orderItemsFixture: OrderItems[] = [
  { id: 1, order_id: 1, ticket_type_id: 3, quantity: 2, unit_price: 499, subtotal: 998 },
  { id: 2, order_id: 2, ticket_type_id: 7, quantity: 1, unit_price: 799, subtotal: 799 },
]
