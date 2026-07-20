import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context'
import { eventsFixture } from '../../lib/fixtures'
import { EventCard } from '../../components/event/EventCard'

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function YourEventsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // All events for this organiser — array-membership filter works from
  // either side, so a co-organised event shows up on both owners' lists.
  // Split by status: ACTIVE → published (grouped by year), PENDING_MODERATION
  // → drafts (flat list, no year grouping since they aren't live yet).
  // eventsFixture.length drives re-runs since the array is mutated in
  // place by the mock POST and the reference itself never changes.
  const { groupedByYear, drafts } = useMemo(() => {
    const empty = {
      groupedByYear: [] as { year: number; events: typeof eventsFixture }[],
      drafts: [] as typeof eventsFixture,
    }
    if (!user) return empty

    const mine = eventsFixture.filter((event) =>
      event.organiser_id.includes(user.user_id),
    )
    const published = mine
      .filter((event) => event.status === 'ACTIVE')
      .sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
      )
    const pending = mine
      .filter((event) => event.status === 'PENDING_MODERATION')
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )

    const groups = new Map<number, typeof eventsFixture>()
    for (const event of published) {
      const year = new Date(event.start_time).getFullYear()
      const list = groups.get(year) ?? []
      list.push(event)
      groups.set(year, list)
    }

    return {
      groupedByYear: Array.from(groups.entries())
        .sort(([a], [b]) => b - a)
        .map(([year, events]) => ({ year, events })),
      drafts: pending,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, eventsFixture.length])

  if (!user) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-text-primary">Your Events</h1>
        <p className="text-text-secondary mt-2">
          Please sign in to view your events.
        </p>
      </section>
    )
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header — matches Module 23 (OrganiserHomePage) pattern */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Your Events
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Every event you organise, past and upcoming.
          </p>
        </div>
        <Link
          to="/org/events/new"
          className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 transition-all shadow-sm shadow-accent/15"
        >
          + Create New Event
        </Link>
      </header>

      {groupedByYear.length === 0 && drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-2 border border-dashed border-border rounded-2xl bg-surface-alt/40">
          <span className="text-3xl opacity-60">📅</span>
          <p className="text-sm font-semibold text-text-primary">
            No events yet
          </p>
          <p className="text-xs text-text-secondary max-w-sm">
            Create your first event to get started.
          </p>
        </div>
      ) : (
        <>
          {groupedByYear.map(({ year, events }) => (
            <div key={year} className="space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xl font-bold text-text-primary">{year}</h2>
                <span className="text-xs text-text-secondary font-medium">
                  {events.length} event{events.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    bannerUrl={event.banner_url ?? null}
                    dateString={formatEventDate(event.start_time)}
                    locationString={event.venue}
                    onNavigate={() =>
                      navigate(`/org/events/${event.id}/edit`)
                    }
                  />
                ))}
              </div>
            </div>
          ))}

          {drafts.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xl font-bold text-text-primary">
                  Draft Events
                </h2>
                <span className="text-xs text-text-secondary font-medium">
                  {drafts.length} event{drafts.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-text-secondary -mt-2">
                Saved as drafts and waiting to be published.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drafts.map((event) => (
                  <div key={event.id} className="flex flex-col gap-2">
                    <EventCard
                      id={event.id}
                      title={event.title}
                      bannerUrl={event.banner_url ?? null}
                      dateString={formatEventDate(event.start_time)}
                      locationString={event.venue}
                      onNavigate={() =>
                        navigate(`/org/events/${event.id}/edit`)
                      }
                    />
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-warning bg-warning/10 border border-warning/25 px-2 py-0.5 rounded-full self-start">
                      Draft
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default YourEventsPage
