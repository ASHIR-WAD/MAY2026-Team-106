import { useParams, Link } from 'react-router-dom'
import { eventsFixture } from '../../lib/fixtures'

export function OrganiserEventEditPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const event = eventsFixture.find((e) => e.id === Number(eventId))

  if (!event) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-text-primary">Event not found</h1>
        <p className="text-text-secondary mt-2">
          We couldn&apos;t find an event with id {eventId}.
        </p>
        <Link
          to="/org/events"
          className="inline-block mt-4 text-accent hover:underline text-sm font-semibold"
        >
          ← Back to Your Events
        </Link>
      </section>
    )
  }

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <Link
          to="/org/events"
          className="text-xs text-text-secondary hover:text-accent font-medium"
        >
          ← Your Events
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary mt-2">
          Edit Event
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Update details for &ldquo;{event.title}&rdquo;.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-6 text-text-secondary text-sm">
        Edit form (Module 25) coming soon.
      </div>
    </section>
  )
}

export default OrganiserEventEditPage
