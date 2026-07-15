import { useParams } from 'react-router-dom'

export function OrganiserProfilePage() {
  const { organiserId } = useParams<{ organiserId: string }>()

  return (
    <section>
      <h1>Organiser {organiserId}</h1>
      <p>Public organiser profile page.</p>
    </section>
  )
}
