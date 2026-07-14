export type ModerationAction = 'APPROVED' | 'PURGED'

export interface PlatformModerationLogs {
  id: number
  admin_id: number | null
  event_id: number | null
  action_taken: ModerationAction | null
  reason: string | null
  logged_at: string
}
