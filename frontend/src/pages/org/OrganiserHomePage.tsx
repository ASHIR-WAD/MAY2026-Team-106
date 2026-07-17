import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context'
import { eventsFixture, ordersFixture } from '../../lib/fixtures'
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

export function OrganiserHomePage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')

  // Events this organiser owns, with start_time in the future.
  const myUpcoming = useMemo(() => {
    if (!user) return []
    const now = Date.now()
    return eventsFixture
      .filter(
        (event) =>
          event.organiser_id.includes(user.user_id) &&
          new Date(event.start_time).getTime() > now,
      )
      .filter((event) =>
        search.trim()
          ? event.title.toLowerCase().includes(search.trim().toLowerCase()) ||
            event.venue.toLowerCase().includes(search.trim().toLowerCase())
          : true,
      )
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
      )
  }, [user, search])

  // Top performers: same event set, ranked by total revenue from
  // SUCCESS orders, top 3-5.
  const topPerforming = useMemo(() => {
    if (!user) return []
    const now = Date.now()
    const myEvents = eventsFixture.filter(
      (event) =>
        event.organiser_id.includes(user.user_id) &&
        new Date(event.start_time).getTime() > now,
    )
    const revenueByEvent = new Map<number, number>()
    for (const order of ordersFixture) {
      if (order.payment_status !== 'SUCCESS') continue
      revenueByEvent.set(
        order.event_id,
        (revenueByEvent.get(order.event_id) ?? 0) + order.total_amount,
      )
    }
    const ranked = myEvents
      .map((event) => ({
        event,
        revenue: revenueByEvent.get(event.id) ?? 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .filter((row) => row.revenue > 0)
    return ranked
  }, [user])

  if (!user) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-text-primary">Organiser</h1>
        <p className="text-text-secondary mt-2">
          Please sign in to view your organiser dashboard.
        </p>
      </section>
    )
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Welcome, {user.name}.
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Here&apos;s what&apos;s happening around your events.
          </p>
        </div>
        <Link
          to="/org/events/new"
          className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 transition-all shadow-sm shadow-accent/15"
        >
          + Create New Event
        </Link>
      </header>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your events…"
          className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-secondary/50 outline-none transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent"
        />
      </div>

      {/* Upcoming */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-xl font-bold text-text-primary">Upcoming</h2>
          <span className="text-xs text-text-secondary font-medium">
            {myUpcoming.length} event{myUpcoming.length !== 1 ? 's' : ''}
          </span>
        </div>

        {myUpcoming.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No upcoming events"
            description={
              search.trim()
                ? 'Nothing matches your search. Try a different keyword.'
                : "You haven't created any upcoming events yet. Kick things off with your first one."
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myUpcoming.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                bannerUrl={event.banner_url ?? null}
                dateString={formatEventDate(event.start_time)}
                locationString={event.venue}
              />
            ))}
          </div>
        )}
      </div>

      {/* Top performing */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-xl font-bold text-text-primary">
            Review your top performing events
          </h2>
          <span className="text-xs text-text-secondary font-medium">
            {topPerforming.length} ranked
          </span>
        </div>

        {topPerforming.length === 0 ? (
          <EmptyState
            icon="📈"
            title="No revenue yet"
            description="Once your events start receiving successful payments, your top performers will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPerforming.map(({ event, revenue }) => (
              <div key={event.id} className="flex flex-col gap-2">
                <EventCard
                  id={event.id}
                  title={event.title}
                  bannerUrl={event.banner_url ?? null}
                  dateString={formatEventDate(event.start_time)}
                  locationString={event.venue}
                />
                <p className="text-xs text-text-secondary px-1">
                  Revenue so far:{' '}
                  <span className="font-semibold text-text-primary">
                    ₹{revenue.toLocaleString()}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 border border-dashed border-border rounded-2xl bg-surface-alt/40">
      <span className="text-3xl opacity-60">{icon}</span>
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      <p className="text-xs text-text-secondary max-w-sm">{description}</p>
    </div>
  )
}
