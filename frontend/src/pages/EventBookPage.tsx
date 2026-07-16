import { useParams } from 'react-router-dom'

export function EventBookPage() {
  const { eventId } = useParams<{ eventId: string }>()

  return (
    <section>
      <h1>Book Event {eventId}</h1>
      <p>Authenticated: choose tickets and check out.</p>
    </section>
  )
}
