import type { UserInterestTags } from '../../types/user_interest_tags'

export const userInterestTagsFixture: UserInterestTags[] = [
  { user_id: 1, tag_id: 1 }, // Arjun likes Music
  { user_id: 1, tag_id: 3 }, // and Comedy
  // Rhea (user_id 2): none — tests empty "might like" ranking
]
