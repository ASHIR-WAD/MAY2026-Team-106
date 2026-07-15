import * as React from 'react'
import { Button } from '../ui/Button'

export interface EventCardProps {
  id: number // ◄— Enforced database primitive type
  title: string
  bannerUrl?: string | null
  dateString: string
  locationString: string
  isBookmarked?: boolean
  onBookmarkToggle?: () => void
  onNavigate?: (id: number) => void // ◄— Enforced database primitive type
}

export function EventCard({
  id,
  title,
  bannerUrl,
  dateString,
  locationString,
  isBookmarked = false,
  onBookmarkToggle,
  onNavigate,
}: EventCardProps) {
  const [imageFailed, setImageFailed] = React.useState(false)

  const handleCardClick = () => {
    onNavigate?.(id)
  }

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onBookmarkToggle?.()
  }

  return (
    <div
      onClick={handleCardClick}
      className="group bg-surface border border-border rounded-xl overflow-hidden cursor-pointer hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all duration-200 flex flex-col h-full"
    >
      <div className="relative w-full h-44 bg-surface-alt overflow-hidden border-b border-border">
        {bannerUrl && !imageFailed ? (
          <img
            src={bannerUrl}
            alt={title}
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-secondary/40 gap-1 bg-surface-alt">
            <span className="text-3xl">🗓️</span>
            <span className="text-xs font-medium tracking-wide uppercase select-none">No Banner Image</span>
          </div>
        )}

        {onBookmarkToggle && (
          <div className="absolute top-3 right-3 z-10">
            <Button
              variant="secondary"
              onClick={handleBookmarkClick}
              type="button"
              className="!h-8 !w-8 !p-0 rounded-full bg-surface/80 backdrop-blur-sm border-border hover:bg-surface focus-visible:ring-accent"
            >
              <span className={`text-sm ${isBookmarked ? 'text-accent' : 'text-text-secondary'}`}>
                {isBookmarked ? '★' : '☆'}
              </span>
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-text-primary font-semibold text-lg leading-snug line-clamp-2 group-hover:text-accent transition-colors" title={title}>
            {title}
          </h3>
          <p className="text-text-secondary text-xs font-mono tracking-tight">
            {dateString}
          </p>
        </div>
        
        <p className="text-text-secondary/80 text-sm truncate flex items-center gap-1.5">
          <span className="text-xs opacity-60">📍</span> {locationString}
        </p>
      </div>
    </div>
  )
}
