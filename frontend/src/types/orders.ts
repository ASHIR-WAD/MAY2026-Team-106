export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

export interface Orders {
  id: number
  attendee_id: number
  event_id: number
  ticket_type_ids: number[] | null
  total_amount: number
  payment_status: PaymentStatus | null
  payment_gateway_ref: string | null
  created_at: string
  access_code: string
}
