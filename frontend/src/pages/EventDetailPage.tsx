import { useParams } from 'react-router-dom'

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()

  return (
    <section>
      <h1>Event {eventId}</h1>
      <p>Public event detail page.</p>
    </section>
  )
}
