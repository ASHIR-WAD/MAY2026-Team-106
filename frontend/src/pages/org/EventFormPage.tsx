import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context'
import {
  eventsFixture,
  mediaGalleryFixture,
  ticketTypesFixture,
} from '../../lib/fixtures'
import { apiPost } from '../../lib/api'
import type { Events } from '../../types/events'
import type { TicketTypes } from '../../types/ticket_types'
import type { MediaGallery } from '../../types/media_gallery'
import { DynamicListField } from '../../components/ui/DynamicListField'

interface EventFormState {
  title: string
  description: string
  venue: string
  registration_deadline: string
  start_time: string
  end_time: string
  imp_info: string[]
  terms_url: string
  capacity_limit: number
  age_limit: number | null
}

const EMPTY_FORM: EventFormState = {
  title: '',
  description: '',
  venue: '',
  registration_deadline: '',
  start_time: '',
  end_time: '',
  imp_info: [],
  terms_url: '',
  capacity_limit: 100,
  age_limit: null,
}

// Event duration default when "Date of Event" is set without an end_time.
// Product decision: a 3-hour default window keeps most casual events inside
// a single session without forcing the organiser to think about end_time
// during creation. Real product would expose this as a separate picker.
const DEFAULT_EVENT_DURATION_MS = 3 * 60 * 60 * 1000

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  // Format YYYY-MM-DDTHH:mm in local time for <input type="datetime-local">.
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalInput(local: string): string {
  if (!local) return ''
  return new Date(local).toISOString()
}

function lastPublishedLabel(updated_at: string | null | undefined): string {
  if (!updated_at) return ''
  return new Date(updated_at).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function EventFormPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const existingEvent = useMemo<Events | null>(() => {
    if (!eventId) return null
    return eventsFixture.find((e) => e.id === Number(eventId)) ?? null
  }, [eventId])

  // Existing ticket types & media rows for this event, fetched from
  // the mock fixtures directly (apiGet isn't async-friendly for the
  // form's initial state without an effect, and these are in-memory).
  const initialTickets = useMemo<TicketTypes[]>(() => {
    if (!eventId) return []
    return ticketTypesFixture.filter((t) => t.event_id === Number(eventId))
  }, [eventId])

  const initialMedia = useMemo<MediaGallery[]>(() => {
    if (!eventId) return []
    return mediaGalleryFixture.filter((m) => m.event_id === Number(eventId))
  }, [eventId])

  const [form, setForm] = useState<EventFormState>(() => {
    if (existingEvent) {
      return {
        title: existingEvent.title,
        description: existingEvent.description ?? '',
        venue: existingEvent.venue,
        registration_deadline: existingEvent.registration_deadline,
        start_time: existingEvent.start_time,
        end_time: existingEvent.end_time,
        imp_info: existingEvent.imp_info ?? [],
        terms_url: existingEvent.terms_url ?? '',
        capacity_limit: existingEvent.capacity_limit,
        age_limit: existingEvent.age_limit,
      }
    }
    return EMPTY_FORM
  })

  // Local CRUD state for ticket tiers and media rows. We commit to the
  // server only on Save/Publish; until then the form is a draft.
  const [tickets, setTickets] = useState<TicketTypes[]>(initialTickets)
  const [media, setMedia] = useState<MediaGallery[]>(initialMedia)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Keep local state in sync if the route changes (e.g. navigating
  // from /new to /:eventId/edit while the component stays mounted).
  useEffect(() => {
    if (existingEvent) {
      setForm({
        title: existingEvent.title,
        description: existingEvent.description ?? '',
        venue: existingEvent.venue,
        registration_deadline: existingEvent.registration_deadline,
        start_time: existingEvent.start_time,
        end_time: existingEvent.end_time,
        imp_info: existingEvent.imp_info ?? [],
        terms_url: existingEvent.terms_url ?? '',
        capacity_limit: existingEvent.capacity_limit,
        age_limit: existingEvent.age_limit,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setTickets(initialTickets)
    setMedia(initialMedia)
  }, [existingEvent, initialTickets, initialMedia])

  if (!user) {
    return (
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-text-primary">
          Organiser sign-in required
        </h1>
        <p className="text-text-secondary mt-2">
          Please sign in as an organiser to manage events.
        </p>
      </section>
    )
  }

  const update = <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleStartTimeChange(value: string) {
    update('start_time', fromLocalInput(value))
    // If end_time hasn't been set yet (or falls before the new start),
    // default to start + 3h. This is a product choice, see top of file.
    const newStartMs = new Date(value).getTime()
    if (Number.isNaN(newStartMs)) return
    const currentEndMs = form.end_time ? new Date(form.end_time).getTime() : NaN
    if (Number.isNaN(currentEndMs) || currentEndMs <= newStartMs) {
      const newEnd = new Date(newStartMs + DEFAULT_EVENT_DURATION_MS).toISOString()
      update('end_time', newEnd)
    }
  }

  async function persist(status: 'PENDING_MODERATION' | 'ACTIVE') {
    setSaving(true)
    setError(null)
    try {
      const nowIso = new Date().toISOString()
      // Default start_time to one week out when the organiser hasn't
      // picked one. Falling back to "now" would make the event look
      // already-started and exclude it from Upcoming.
      const startTimeDefault = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString()
      const endTime =
        form.end_time ||
        (form.start_time
          ? new Date(
              new Date(form.start_time).getTime() + DEFAULT_EVENT_DURATION_MS,
            ).toISOString()
          : startTimeDefault)

      const basePayload: Omit<Events, 'id' | 'created_at' | 'updated_at' | 'status'> = {
        organiser_id: [user!.user_id],
        title: form.title,
        description: form.description || null,
        imp_info: form.imp_info.filter((s) => s.trim().length > 0),
        venue: form.venue,
        capacity_limit: Number(form.capacity_limit) || 0,
        registration_deadline:
          form.registration_deadline || startTimeDefault,
        start_time: form.start_time || startTimeDefault,
        end_time: endTime,
        age_limit: form.age_limit,
        // banner / thumbnail are picked from the Gallery & Media section below.
        banner_url: media[0]?.image_url ?? existingEvent?.banner_url ?? null,
        pfp_url: media[1]?.image_url ?? media[0]?.image_url ?? existingEvent?.pfp_url ?? null,
        terms_url: form.terms_url.trim() || null,
      }

      let savedId: number
      if (existingEvent) {
        // Edit-in-place: update the fixture row directly so subsequent
        // loads (YourEventsPage) reflect the new state. A real backend
        // would PATCH /events/:id here.
        Object.assign(existingEvent, basePayload, {
          status,
          updated_at: nowIso,
        })
        savedId = existingEvent.id
      } else {
        const created = await apiPost<Events>('/events', {
          ...basePayload,
          status,
        })
        savedId = created.id
      }

      // Persist ticket tiers. For new tiers (id === 0) we POST and
      // push to the fixture; for existing tiers we update the fixture
      // row in place so price/name/total edits made in the form are
      // not silently dropped. quantity_sold is never changed by the
      // organiser — once tickets start selling, that field is owned
      // by the order pipeline.
      for (const tier of tickets) {
        const existingIdx = ticketTypesFixture.findIndex((t) => t.id === tier.id)
        if (existingIdx >= 0) {
          const existing = ticketTypesFixture[existingIdx]
          ticketTypesFixture[existingIdx] = {
            ...existing,
            name: tier.name,
            price: tier.price,
            // Honour the lower bound: never let total drop below sold.
            quantity_total: Math.max(tier.quantity_total, existing.quantity_sold),
            event_id: savedId,
          }
        } else {
          await apiPost<TicketTypes>('/ticket-types', {
            ...tier,
            event_id: savedId,
          })
        }
      }

      // Persist media rows. Same pattern: in-place update for existing
      // rows, POST for new ones.
      for (const m of media) {
        const existingIdx = mediaGalleryFixture.findIndex((row) => row.id === m.id)
        if (existingIdx >= 0) {
          mediaGalleryFixture[existingIdx] = {
            ...mediaGalleryFixture[existingIdx],
            image_url: m.image_url,
            event_id: savedId,
          }
        } else {
          await apiPost<MediaGallery>('/media-gallery', {
            ...m,
            event_id: savedId,
          })
        }
      }

      setToast(
        status === 'ACTIVE'
          ? 'Published — sent for admin review.'
          : 'Draft saved.',
      )
      setTimeout(() => navigate('/org/events'), 700)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  function handleDelete() {
    if (!existingEvent) return
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }
    // Remove from fixtures in place. A real backend would DELETE /events/:id.
    const idx = eventsFixture.findIndex((e) => e.id === existingEvent.id)
    if (idx >= 0) eventsFixture.splice(idx, 1)
    navigate('/org/events')
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <header className="space-y-3">
        <Link
          to="/org/events"
          className="text-xs text-text-secondary hover:text-accent font-medium"
        >
          ← Your Events
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Untitled event"
            className="w-full sm:max-w-xl bg-transparent border-0 border-b border-transparent focus:border-accent text-3xl font-extrabold tracking-tight text-text-primary outline-none px-0 py-1"
          />
          <div className="flex flex-wrap items-center gap-2">
            {existingEvent && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-text-secondary hover:text-danger hover:border-danger/40 transition-colors"
                aria-label="Delete event"
                title={deleteConfirm ? 'Click again to confirm delete' : 'Delete event'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            )}
            <button
              type="button"
              disabled={saving || !form.title.trim()}
              onClick={() => persist('PENDING_MODERATION')}
              className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-alt transition-colors disabled:opacity-40"
            >
              Save
            </button>
            <button
              type="button"
              disabled={saving || !form.title.trim()}
              onClick={() => persist('ACTIVE')}
              className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 transition-colors disabled:opacity-40"
            >
              Publish
            </button>
          </div>
        </div>
        {existingEvent?.updated_at && (
          <p className="text-xs text-text-secondary">
            Last Published on {lastPublishedLabel(existingEvent.updated_at)}
            {deleteConfirm && (
              <span className="ml-3 text-danger font-semibold">
                Click trash again to confirm delete.
              </span>
            )}
          </p>
        )}
      </header>

      {error && (
        <p className="text-xs text-danger leading-relaxed bg-danger/10 border border-danger/25 p-3 rounded-lg">
          {error}
        </p>
      )}
      {toast && (
        <p className="text-xs text-success leading-relaxed bg-success/10 border border-success/25 p-3 rounded-lg">
          {toast}
        </p>
      )}

      {/* Description */}
      <FormSection title="Description">
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="What is this event about?"
          rows={4}
          className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-secondary/50 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent"
        />
      </FormSection>

      {/* Location */}
      <FormSection title="Location">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={form.venue}
            onChange={(e) => update('venue', e.target.value)}
            placeholder="Venue name or address"
            className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-secondary/50 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent"
          />
          {form.venue.trim() && (
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(form.venue)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-text-secondary hover:text-accent hover:border-accent/40 transition-colors"
              aria-label="Open in Maps"
              title="Open in Maps"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          )}
        </div>
      </FormSection>

      {/* Registration Deadline + Date of Event */}
      <FormSection title="Registration Deadline & Date of Event">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Registration Deadline
            </label>
            <input
              type="datetime-local"
              value={toLocalInput(form.registration_deadline)}
              onChange={(e) => update('registration_deadline', fromLocalInput(e.target.value))}
              className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={toLocalInput(form.start_time)}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">
              End Time
            </label>
            <input
              type="datetime-local"
              value={toLocalInput(form.end_time)}
              onChange={(e) => update('end_time', fromLocalInput(e.target.value))}
              className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent"
            />
          </div>
        </div>
        <p className="text-xs text-text-secondary mt-2">
          End Time defaults to Start + 3 hours. Adjust if your event runs longer.
        </p>
      </FormSection>

      {/* Things To Know */}
      <FormSection title="Things To Know">
        <DynamicListField
          value={form.imp_info}
          onChange={(next) => update('imp_info', next)}
          placeholder="e.g. Doors open at 6:00 PM"
          addLabel="Add note"
        />
      </FormSection>

      {/* Terms & Conditions */}
      <FormSection
        title="Terms and Conditions"
        subtitle="Paste a link to your hosted terms document. The schema stores this as terms_url — there is no inline terms field."
      >
        <input
          type="url"
          value={form.terms_url}
          onChange={(e) => update('terms_url', e.target.value)}
          placeholder="https://example.com/terms"
          className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-secondary/50 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent"
        />
      </FormSection>

      {/* Pricing & Availability */}
      <FormSection
        title="Pricing & Availability"
        subtitle="Each row is a ticket tier. Availability is read-only once any have sold."
      >
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt text-text-secondary">
                <th className="text-left font-medium px-3 py-2">Category</th>
                <th className="text-left font-medium px-3 py-2">Pricing</th>
                <th className="text-left font-medium px-3 py-2">Total</th>
                <th className="text-left font-medium px-3 py-2">Availability</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-text-secondary text-xs">
                    No ticket tiers yet. Add one to get started.
                  </td>
                </tr>
              ) : (
                tickets.map((tier, i) => {
                  const hasSold = tier.quantity_sold > 0
                  return (
                    <tr key={tier.id ?? i} className="border-t border-border">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => {
                            const next = tickets.slice()
                            next[i] = { ...tier, name: e.target.value }
                            setTickets(next)
                          }}
                          placeholder="Tier name"
                          className="h-9 w-full rounded-md border border-border bg-surface px-2 text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <span className="text-text-secondary text-xs">₹</span>
                          <input
                            type="number"
                            min={0}
                            value={tier.price}
                            autoComplete="off"
                            onChange={(e) => {
                              const next = tickets.slice()
                              next[i] = { ...tier, price: Number(e.target.value) || 0 }
                              setTickets(next)
                            }}
                            className="h-9 w-24 rounded-md border border-border bg-surface px-2 text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent"
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={hasSold ? tier.quantity_sold : 0}
                          disabled={hasSold}
                          value={tier.quantity_total}
                          onChange={(e) => {
                            const next = tickets.slice()
                            const v = Number(e.target.value) || 0
                            next[i] = { ...tier, quantity_total: hasSold ? tier.quantity_sold : v }
                            setTickets(next)
                          }}
                          className="h-9 w-24 rounded-md border border-border bg-surface px-2 text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          title={hasSold ? `Locked: ${tier.quantity_sold} already sold` : undefined}
                        />
                      </td>
                      <td className="px-3 py-2 text-text-secondary">
                        {Math.max(0, tier.quantity_total - tier.quantity_sold)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setTickets(tickets.filter((_, j) => j !== i))}
                          className="text-xs font-semibold text-danger hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={() =>
            setTickets([
              ...tickets,
              {
                id: 0, // 0 → mock assigns the next id on POST
                event_id: existingEvent?.id ?? 0,
                name: '',
                price: 0,
                quantity_total: 100,
                quantity_sold: 0,
              },
            ])
          }
          className="self-start inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 transition-colors px-1 py-1"
        >
          + Add ticket tier
        </button>
      </FormSection>

      {/* Gallery & Media */}
      <FormSection
        title="Gallery & Media"
        subtitle="Both map to the same media_gallery array. Gallery is the large hero slot; Media is the row of smaller thumbnails."
      >
        {media.length === 0 ? (
          <p className="text-xs text-text-secondary italic">No media yet — gallery and media sections are empty.</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Gallery</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {media.slice(0, 1).map((m) => (
                  <MediaTile key={m.id ?? m.image_url} m={m} onRemove={() => setMedia(media.filter((row) => row !== m))} large />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Media</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {media.map((m) => (
                  <MediaTile key={m.id ?? m.image_url} m={m} onRemove={() => setMedia(media.filter((row) => row !== m))} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="url"
              id="new-media-url"
              placeholder="Paste image URL"
              className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-secondary/50 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent"
            />
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('new-media-url') as HTMLInputElement | null
                if (!el) return
                const url = el.value.trim()
                if (!url) return
                setMedia([
                  ...media,
                  { id: 0, event_id: existingEvent?.id ?? 0, image_url: url },
                ])
                el.value = ''
              }}
              className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-alt transition-colors"
            >
              + Add URL
            </button>
          </div>

          {/* File picker — creates a local object URL so the preview
              works without a backend. Object URLs are session-scoped and
              will not survive a page refresh; a real upload pipeline
              would push to storage and replace image_url with the CDN URL. */}
          <label className="inline-flex items-center justify-center rounded-md border border-dashed border-border bg-surface-alt/40 px-4 py-3 text-sm font-semibold text-text-secondary hover:text-accent hover:border-accent/40 cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-4 h-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Choose from device
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                if (files.length === 0) return
                const additions: MediaGallery[] = files.map((f) => ({
                  id: 0,
                  event_id: existingEvent?.id ?? 0,
                  // Object URL is valid for this session only.
                  image_url: URL.createObjectURL(f),
                }))
                setMedia([...media, ...additions])
                e.target.value = '' // reset so picking the same file again re-fires
              }}
            />
          </label>
        </div>
      </FormSection>
    </section>
  )
}

function FormSection({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
        {subtitle && (
          <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  )
}

function MediaTile({
  m,
  onRemove,
  large = false,
}: {
  m: MediaGallery
  onRemove: () => void
  large?: boolean
}) {
  return (
    <div className={`relative group rounded-md overflow-hidden border border-border bg-surface-alt ${large ? 'aspect-[16/9]' : 'aspect-square'}`}>
      <img
        src={m.image_url}
        alt=""
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.opacity = '0.2'
        }}
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 inline-flex h-7 w-7 items-center justify-center rounded-md bg-surface/80 backdrop-blur-sm border border-border text-text-secondary hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Remove image"
      >
        ×
      </button>
    </div>
  )
}

export default EventFormPage
