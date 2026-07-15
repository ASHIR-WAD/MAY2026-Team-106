import type { UserFollows } from '../../types/user_follows'

export const userFollowsFixture: UserFollows[] = [
  { follower_id: 1, following_id: 3, followed_at: '2026-05-10T12:00:00Z' }, // Arjun follows Beatworks
  // Rhea follows nobody
]
