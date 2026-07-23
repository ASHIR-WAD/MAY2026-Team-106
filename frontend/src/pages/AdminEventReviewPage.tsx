import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { EventGallery } from '../components/event/EventGallery'
import { OrganiserChip } from '../components/event/OrganiserChip'
import { adminEventModerationItems } from '../lib/fixtures/adminMocks'
import { eventsFixture } from '../lib/fixtures/events'
import { mediaGalleryFixture } from '../lib/fixtures/mediaGallery'
import { ticketTypesFixture } from '../lib/fixtures/ticketTypes'
import { usersFixture } from '../lib/fixtures/users'

export function AdminEventReviewPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const [takeDownReason, setTakeDownReason] = useState('')

  const numericEventId = eventId ? Number(eventId) : NaN

  const moderationItem = useMemo(() => {
    if (Number.isNaN(numericEventId)) return null
    return adminEventModerationItems.find((item) => item.id === numericEventId) ?? null
  }, [numericEventId])

  const eventDetail = useMemo(() => {
    if (Number.isNaN(numericEventId)) return null
    return eventsFixture.find((event) => event.id === numericEventId) ?? null
  }, [numericEventId])

  if (!eventDetail || !moderationItem) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <h2 className="mb-2 text-xl font-semibold text-text-primary">Event review not found</h2>
        <p className="mb-6 text-sm text-text-secondary">The selected event could not be loaded.</p>
        <Button variant="secondary" onClick={() => navigate('/admin')}>
          Back to dashboard
        </Button>
      </div>
    )
  }

  const eventTicketTypes = ticketTypesFixture.filter((ticket) => ticket.event_id === eventDetail.id)
  const startingPrice = eventTicketTypes.length > 0
    ? Math.min(...eventTicketTypes.map((ticket) => ticket.price))
    : null

  const organisers = eventDetail.organiser_id
    .map((id) => usersFixture.find((user) => user.user_id === id))
    .filter((user): user is (typeof usersFixture)[number] => Boolean(user))
  const primaryOrganiser = organisers[0]
  const coOrganiserCount = organisers.length - 1
  const formattedDate = new Date(eventDetail.start_time).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Admin review</p>
          <h1 className="text-2xl font-semibold text-text-primary">{eventDetail.title}</h1>
          <p className="mt-1 text-sm text-text-secondary">{formattedDate} • {eventDetail.venue}</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/admin')}>
          Back to dashboard
        </Button>
      </div>

      <div className="relative h-72 overflow-hidden rounded-2xl border border-border bg-surface-alt">
        {eventDetail.banner_url ? (
          <img src={eventDetail.banner_url} alt={eventDetail.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-secondary">No banner image</div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-secondary">Starting from</p>
          <p className="text-lg font-semibold text-text-primary">
            {startingPrice !== null ? `₹${startingPrice}` : 'Free / TBD'}
          </p>
        </div>
        <div className="text-sm text-text-secondary">
          <p className="font-semibold text-text-primary">Current status</p>
          <p>{moderationItem.status}</p>
        </div>
      </div>

      {eventDetail.description && (
        <p className="text-sm leading-relaxed text-text-primary">{eventDetail.description}</p>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-text-primary">Things to know</h2>
        {(eventDetail.imp_info?.length ?? 0) > 0 ? (
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-secondary">
            {eventDetail.imp_info?.map((info, index) => (
              <li key={`${info}-${index}`}>{info}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-secondary">No additional information provided for this event.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-text-primary">Gallery</h2>
        <EventGallery eventId={eventDetail.id} galleryItems={mediaGalleryFixture} />
      </section>

      {eventDetail.terms_url && (
        <a href={eventDetail.terms_url} target="_blank" rel="noreferrer" className="text-sm text-accent underline underline-offset-2">
          View Terms & Conditions
        </a>
      )}

      {primaryOrganiser && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-text-primary">About the organiser</h2>
          <OrganiserChip name={primaryOrganiser.name} pfpUrl={primaryOrganiser.pfp_url ?? undefined} />
          {coOrganiserCount > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-text-secondary">+{coOrganiserCount} co-organiser{coOrganiserCount > 1 ? 's' : ''}</span>
              {organisers.slice(1).map((organiser) => (
                <OrganiserChip key={organiser.user_id} name={organiser.name} pfpUrl={organiser.pfp_url ?? undefined} />
              ))}
            </div>
          )}
        </section>
      )}

      <div className="rounded-2xl border border-border bg-surface-alt/70 p-4 space-y-3">
        <label className="block text-sm font-semibold text-text-primary" htmlFor="moderation-reason">
          Reason for taking down
        </label>
        <textarea
          id="moderation-reason"
          rows={4}
          value={takeDownReason}
          onChange={(event) => setTakeDownReason(event.target.value)}
          placeholder="Explain why this event should be taken down..."
          className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => navigate('/admin')}>
          Cancel
        </Button>
        <Button variant="primary" disabled={!takeDownReason.trim()} onClick={() => navigate('/admin')}>
          Take Down
        </Button>
      </div>
    </div>
  )
}

export default AdminEventReviewPage
