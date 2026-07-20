import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { eventsFixture } from '../lib/fixtures/events.ts' 
import { ticketTypesFixture } from '../lib/fixtures/ticketTypes.ts'
import { mediaGalleryFixture } from '../lib/fixtures/mediaGallery.ts'
import { usersFixture } from '../lib/fixtures/users.ts'
import { EventGallery } from '../components/event/EventGallery'
import { OrganiserChip } from '../components/event/OrganiserChip'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context'

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { user, updateProfile } = useAuth()

  const numericEventId = eventId ? Number(eventId) : NaN

  const event = React.useMemo(() => {
    if (Number.isNaN(numericEventId)) return undefined
    return eventsFixture.find((e) => e.id === numericEventId)
  }, [numericEventId])

  // --- Not found state ---
  if (!event) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Event not found
        </h2>
        <p className="text-text-secondary text-sm mb-6">
          The event you're looking for doesn't exist or may have been removed.
        </p>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    )
  }

  const eventTicketTypes = ticketTypesFixture.filter(
    (t) => t.event_id === event.id,
  )
  const startingPrice =
    eventTicketTypes.length > 0
      ? Math.min(...eventTicketTypes.map((t) => t.price))
      : null

  const organisers = React.useMemo(() => {
    return event.organiser_id
      .map((id) => usersFixture.find((u) => u.user_id === id))
      .filter((u): u is (typeof usersFixture)[number] => Boolean(u))
  }, [event.organiser_id])

  const primaryOrganiser = organisers[0]
  const coOrganiserCount = organisers.length - 1

  const isCancelled = event.status === 'CANCELLED'

  const formattedDate = React.useMemo(() => {
    const start = new Date(event.start_time)
    return start.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }, [event.start_time])

  const isBookmarked = user?.bookmarks?.includes(event.id) ?? false

  const toggleBookmark = () => {
    if (!user) {
      navigate('/auth/login')
      return
    }

    const currentBookmarks = user.bookmarks || []
    const nextBookmarks = currentBookmarks.includes(event.id)
      ? currentBookmarks.filter((id) => id !== event.id)
      : [...currentBookmarks, event.id]

    updateProfile({ bookmarks: nextBookmarks })
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Cancelled banner */}
      {isCancelled && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium px-4 py-3 rounded-lg mb-4">
          This event has been cancelled. Booking is disabled.
        </div>
      )}

      {/* Banner */}
      <div className="relative w-full h-64 rounded-xl overflow-hidden bg-surface-alt border border-border mb-6">
        {event.banner_url ? (
          <img
            src={event.banner_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary/40">
            No Banner Image
          </div>
        )}

        {/* Bookmark icon */}
        <div className="absolute top-3 right-3 z-10">
          <Button
            variant="secondary"
            onClick={toggleBookmark}
            type="button"
            className="!h-9 !w-9 !p-0 rounded-full bg-surface/80 backdrop-blur-sm border-border"
          >
            <span className={isBookmarked ? 'text-accent' : 'text-text-secondary'}>
              {isBookmarked ? '★' : '☆'}
            </span>
          </Button>
        </div>
      </div>

      {/* Title + metadata */}
      <h1 className="text-2xl font-bold text-text-primary mb-1">{event.title}</h1>
      <p className="text-text-secondary text-sm font-mono mb-1">{formattedDate}</p>
      <p className="text-text-secondary text-sm mb-4">{event.venue}</p>

      {/* Description */}
      {event.description && (
        <p className="text-text-primary text-sm leading-relaxed mb-6">
          {event.description}
        </p>
      )}

      {/* Starting price + Book button */}
      <div className="flex items-center justify-between bg-surface border border-border rounded-xl p-4 mb-8">
        <div>
          <p className="text-xs text-text-secondary uppercase tracking-wide mb-0.5">
            Starting from
          </p>
          <p className="text-lg font-semibold text-text-primary">
            {startingPrice !== null ? `₹${startingPrice}` : 'Free / TBD'}
          </p>
        </div>
        <Button
          variant="primary"
          disabled={isCancelled}
          onClick={() => navigate(`/event/${event.id}/book`)}
        >
          {isCancelled ? 'Booking Closed' : 'Book Tickets'}
        </Button>
      </div>

      {/* Things to know */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-3">
          Things to know
        </h2>
        {event.imp_info && event.imp_info.length > 0 ? (
          <ul className="list-disc list-inside space-y-1.5 text-sm text-text-secondary">
            {event.imp_info.map((info, idx) => (
              <li key={idx}>{info}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-secondary/70">
            No additional information provided for this event.
          </p>
        )}
      </section>

      {/* Gallery */}
      <section className="mb-8">
        <EventGallery eventId={event.id} galleryItems={mediaGalleryFixture} />
      </section>

      {/* Terms & Conditions */}
      {event.terms_url && (
        <div className="mb-8">
          <a
            href={event.terms_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent underline underline-offset-2"
          >
            View Terms & Conditions
          </a>
        </div>
      )}

      {/* About Organiser */}
      {primaryOrganiser && (
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">
            About the Organiser
          </h2>
          <OrganiserChip
            name={primaryOrganiser.name}
            pfpUrl={primaryOrganiser.pfp_url ?? undefined}
          />

          {coOrganiserCount > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-text-secondary">
                +{coOrganiserCount} co-organiser{coOrganiserCount > 1 ? 's' : ''}
              </span>
              {organisers.slice(1).map((org) => (
                <OrganiserChip key={org.user_id} name={org.name} pfpUrl={org.pfp_url ?? undefined} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}