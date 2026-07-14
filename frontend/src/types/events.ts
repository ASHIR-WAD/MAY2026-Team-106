export type EventStatus = 'PENDING_MODERATION' | 'ACTIVE' | 'CANCELLED'

export interface Events {
  id: number
  organiser_id: number[]
  title: string
  description: string | null
  imp_info: string[] | null
  venue: string
  capacity_limit: number
  registration_deadline: string
  start_time: string
  end_time: string
  age_limit: number | null
  banner_url: string | null
  pfp_url: string | null
  status: EventStatus | null
  created_at: string
  updated_at: string
  terms_url: string | null
}
