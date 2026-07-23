
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import {
  adminDashboardMetrics,
  adminEventModerationItems,
  adminOrganiserModerationItems,
} from '../lib/fixtures/adminMocks'

export function AdminHome() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [eventItems] = useState(adminEventModerationItems)
  const [organiserItems, setOrganiserItems] = useState(adminOrganiserModerationItems)

  const filteredEvents = useMemo(
    () =>
      eventItems.filter((item) => item.status === 'LIVE' && (
        item.eventTitle.toLowerCase().includes(search.toLowerCase()) ||
        item.organiser.toLowerCase().includes(search.toLowerCase())
      )),
    [eventItems, search]
  )

  const filteredOrganisers = useMemo(
    () =>
      organiserItems.filter((item) =>
        item.organiser.toLowerCase().includes(search.toLowerCase())
      ),
    [organiserItems, search]
  )

  const handleReview = (id: number) => {
    navigate(`/admin/events/${id}/review`)
  }

  const handleDeactivate = (id: number) => {
    setOrganiserItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: 'UNDER_REVIEW' } : item
      )
    )
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
            <p className="mt-2 text-text-secondary">Monitor platform health, approvals, and moderation actions.</p>
          </div>
          <div className="w-full max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events or organisers"
              className="w-full rounded-2xl border border-border bg-surface-alt px-4 py-3 text-text-primary placeholder:text-text-secondary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {adminDashboardMetrics.map((metric) => (
          <div key={metric.title} className="rounded-2xl border border-border bg-surface p-6">
            <p className="text-sm font-semibold text-text-secondary">{metric.title}</p>
            <p className="mt-4 text-3xl font-bold text-text-primary">{metric.value}</p>
            <p className="mt-2 text-sm text-text-secondary">{metric.description}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Live events</h2>
              <p className="mt-1 text-sm text-text-secondary">Review active listings and keep the experience polished.</p>
            </div>
            <Button variant="secondary" size="sm">Refresh</Button>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-alt text-text-secondary">
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Organizer</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((item) => (
                  <tr key={item.id} className="border-t border-border/70">
                    <td className="px-4 py-3 text-text-primary">{item.eventTitle}</td>
                    <td className="px-4 py-3 text-text-secondary">{item.organiser}</td>
                    <td className="px-4 py-3">
                      <Button variant="secondary" size="sm" onClick={() => handleReview(item.id)}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold text-text-primary">Organizer actions</h2>
          <p className="mt-1 text-sm text-text-secondary">Review organizer accounts and trigger moderation status changes.</p>

          <div className="mt-6 space-y-4">
            {filteredOrganisers.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface-alt/70 p-4">
                <div>
                  <p className="font-semibold text-text-primary">{item.organiser}</p>
                  <p className="text-sm text-text-secondary">{item.status}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => handleDeactivate(item.id)}>
                  Deactivate
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}

export default AdminHome
