export type BroadcastType = 'CRITICAL_UPDATE' | 'EARLY_BIRD'

export interface Notifications {
  id: number
  event_id: number | null
  title: string
  message: string
  broadcast_type: BroadcastType | null
  sent_at: string
}
