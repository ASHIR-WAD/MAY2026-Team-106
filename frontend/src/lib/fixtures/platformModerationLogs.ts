import type { PlatformModerationLogs } from '../../types/platform_moderation_logs'

export const platformModerationLogsFixture: PlatformModerationLogs[] = [
  {
    id: 1,
    admin_id: 6, // references the ADMIN row in the merged users table
    event_id: 5,
    action_taken: 'APPROVED',
    reason: 'Organiser requested cancellation due to venue unavailability.',
    logged_at: '2026-07-12T15:50:00Z',
  },
]
