import type { MediaGallery } from '../../types/media_gallery'

export const mediaGalleryFixture: MediaGallery[] = [
  { id: 1, event_id: 1, image_url: 'https://picsum.photos/seed/gal1/400' },
  { id: 2, event_id: 1, image_url: 'https://picsum.photos/seed/gal2/400' },
  { id: 3, event_id: 3, image_url: 'https://picsum.photos/seed/gal3/400' },
  // event_id 4 (Startup Pitch Night): no gallery rows — empty state
]
