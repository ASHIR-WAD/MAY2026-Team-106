import * as React from 'react'
import { Modal } from '../ui/Modal'

export interface MediaItem {
  id: number // ◄— Enforced database primary key
  event_id: number // ◄— Enforced relational foreign key
  image_url: string
}

export interface EventGalleryProps {
  eventId: number // ◄— Enforced structural input
  galleryItems: MediaItem[]
}

export function EventGallery({ eventId, galleryItems }: EventGalleryProps) {
  const [selectedImageUrl, setSelectedImageUrl] = React.useState<string | null>(null)

  const filteredPhotos = React.useMemo(() => {
    return galleryItems.filter((item) => item.event_id === eventId)
  }, [galleryItems, eventId])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <h3 className="text-lg font-semibold text-text-primary">Event Media Gallery</h3>
        <span className="text-xs font-mono text-text-secondary bg-surface-alt px-2 py-0.5 rounded border border-border">
          {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'}
        </span>
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center bg-surface/30 select-none">
          <span className="text-2xl block mb-2 opacity-40">📸</span>
          <p className="text-sm text-text-secondary font-medium">No photos yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedImageUrl(photo.image_url)}
              className="relative aspect-square rounded-lg overflow-hidden bg-surface-alt border border-border cursor-pointer group hover:border-accent/50 transition-all duration-200"
            >
              <img
                src={photo.image_url}
                alt="Event overview snapshot"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={selectedImageUrl !== null} onClose={() => setSelectedImageUrl(null)}>
        {selectedImageUrl && (
          <div className="space-y-4">
            <div className="relative aspect-video w-full rounded-md overflow-hidden bg-black flex items-center justify-center border border-border">
              <img
                src={selectedImageUrl}
                alt="Expanded review"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedImageUrl(null)}
                className="px-4 py-2 text-sm font-medium bg-surface-alt hover:bg-border text-text-primary rounded-md border border-border outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
              >
                Close Viewport
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
