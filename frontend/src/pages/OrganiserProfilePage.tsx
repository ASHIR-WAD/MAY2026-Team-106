import * as React from 'react'
import { useParams } from 'react-router-dom'
import { apiGet } from '../lib/api'
import { StarRating } from '../components/ui/StarRating'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context'
import { userFollowsFixture } from '../lib/fixtures'
import type { Users } from '../types/users'
import type { Events } from '../types/events'
import type { Orders } from '../types/orders'
import type { EventReviews } from '../types/event_reviews'
import type { MediaGallery } from '../types/media_gallery'

const GALLERY_DISPLAY_CAP = 12

export function OrganiserProfilePage() {
  const { organiserId } = useParams<{ organiserId: string }>()
  const { user: currentUser } = useAuth()
  const numericOrganiserId = organiserId ? Number(organiserId) : NaN

  const [organiser, setOrganiser] = React.useState<Users | null>(null)
  const [organiserEvents, setOrganiserEvents] = React.useState<Events[]>([])
  const [averageRating, setAverageRating] = React.useState<number | null>(null)
  const [reviewCount, setReviewCount] = React.useState(0)
  const [galleryImages, setGalleryImages] = React.useState<MediaGallery[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isFollowLoading, setIsFollowLoading] = React.useState(false)
  // Bump on every follow toggle so the derived `isFollowing` re-evaluates —
  // the fixture is a module-level array, so React won't notice mutations
  // unless we tell it to re-render.
  const [followTick, setFollowTick] = React.useState(0)

  // Read follow state from the shared fixture so it stays in sync with the
  // Favourites page. Re-derives on user change, route change, or follow tick.
  const isFollowing = React.useMemo(() => {
    if (!currentUser) return false
    return userFollowsFixture.some(
      (row) => row.follower_id === currentUser.user_id && row.following_id === numericOrganiserId,
    )
  }, [currentUser, numericOrganiserId, followTick])

  const toggleFollow = () => {
    if (!currentUser) return
    if (Number.isNaN(numericOrganiserId)) return

    setIsFollowLoading(true)
    const existingIndex = userFollowsFixture.findIndex(
      (row) => row.follower_id === currentUser.user_id && row.following_id === numericOrganiserId,
    )

    if (existingIndex !== -1) {
      userFollowsFixture.splice(existingIndex, 1)
    } else {
      userFollowsFixture.push({
        follower_id: currentUser.user_id,
        following_id: numericOrganiserId,
        followed_at: new Date().toISOString(),
      })
    }
    setFollowTick((t) => t + 1)
    setIsFollowLoading(false)
  }

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      if (Number.isNaN(numericOrganiserId)) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      const [allUsers, allEvents, allOrders, allReviews, allGallery] = await Promise.all([
        apiGet<Users[]>('/users'),
        apiGet<Events[]>('/events'),
        apiGet<Orders[]>('/orders'),
        apiGet<EventReviews[]>('/event-reviews'),
        apiGet<MediaGallery[]>('/media-gallery'),
      ])

      if (cancelled) return

      const foundOrganiser = allUsers.find((u) => u.user_id === numericOrganiserId) ?? null

      // Events this person organises (co-organised events included)
      const myEvents = allEvents.filter((e) => e.organiser_id.includes(numericOrganiserId))
      const myEventIds = new Set(myEvents.map((e) => e.id))

      // Reviews: event_reviews -> orders -> events -> organiser_id
      const myOrders = allOrders.filter((o) => myEventIds.has(o.event_id))
      const myOrderIds = new Set(myOrders.map((o) => o.id))
      const myReviews = allReviews.filter(
        (r) => r.order_id !== null && myOrderIds.has(r.order_id),
      )

      const avg =
        myReviews.length > 0
          ? myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length
          : null

      // Gallery aggregated across all of this organiser's events
      const myGallery = allGallery
        .filter((g) => myEventIds.has(g.event_id))
        .slice(0, GALLERY_DISPLAY_CAP)

      setOrganiser(foundOrganiser)
      setOrganiserEvents(myEvents)
      setAverageRating(avg)
      setReviewCount(myReviews.length)
      setGalleryImages(myGallery)
      setIsLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [numericOrganiserId])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-text-secondary text-sm">
        Loading organiser profile...
      </div>
    )
  }

  if (!organiser) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Organiser not found
        </h2>
      </div>
    )
  }

  const now = new Date()
  const upcomingEvents = organiserEvents
    .filter((e) => new Date(e.start_time) > now)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 bg-surface border border-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-accent/10 border border-border flex items-center justify-center flex-shrink-0">
            {organiser.pfp_url ? (
              <img
                src={organiser.pfp_url}
                alt={organiser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-accent">
                {organiser.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <h1 className="text-xl font-bold text-text-primary">{organiser.name}</h1>
            {organiser.description && (
              <p className="text-sm text-text-secondary mt-1 max-w-md">
                {organiser.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2">
              {averageRating !== null ? (
                <>
                  <StarRating mode="read" rating={Math.round(averageRating)} />
                  <span className="text-sm text-text-secondary">
                    {averageRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
                  </span>
                </>
              ) : (
                <span className="text-sm text-text-secondary/70">No reviews yet</span>
              )}
            </div>
          </div>
        </div>

        <Button
          variant={isFollowing ? 'secondary' : 'primary'}
          size="sm"
          disabled={isFollowLoading}
          onClick={toggleFollow}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {galleryImages.map((img) => (
              <div
                key={img.id}
                className="aspect-square rounded-lg overflow-hidden bg-surface-alt border border-border"
              >
                <img
                  src={img.image_url}
                  alt="Organiser event"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming events */}
      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-3">
          Upcoming events by this organiser
        </h2>

        {upcomingEvents.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-8 text-center text-sm text-text-secondary">
            No upcoming events right now.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between bg-surface border border-border rounded-xl p-4"
              >
                <div>
                  <p className="font-semibold text-text-primary">{event.title}</p>
                  <p className="text-xs text-text-secondary">{event.venue}</p>
                </div>
                <span className="text-xs text-text-secondary font-mono">
                  {new Date(event.start_time).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}