import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context'
import { apiGet, apiPost } from '../lib/api'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { StarRating } from '../components/ui/StarRating'
import type { Orders } from '../types/orders'
import type { Events } from '../types/events'
import type { EventReviews } from '../types/event_reviews'

interface BookingRow {
  order: Orders
  event: Events
}

export function BookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [bookings, setBookings] = React.useState<BookingRow[]>([])
  const [reviews, setReviews] = React.useState<Record<number, EventReviews>>({})
  const [isLoading, setIsLoading] = React.useState(true)

  // Rating modal state
  const [ratingOrderId, setRatingOrderId] = React.useState<number | null>(null)
  const [ratingValue, setRatingValue] = React.useState(0)
  const [commentValue, setCommentValue] = React.useState('')
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      if (!user) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      const [allOrders, allEvents, allReviews] = await Promise.all([
        apiGet<Orders[]>('/orders'),
        apiGet<Events[]>('/events'),
        apiGet<EventReviews[]>('/event-reviews'),
      ])

      if (cancelled) return

      const myOrders = allOrders.filter((o) => o.attendee_id === user.user_id)
      const rows: BookingRow[] = myOrders
        .map((order) => {
          const event = allEvents.find((e) => e.id === order.event_id)
          return event ? { order, event } : null
        })
        .filter((row): row is BookingRow => row !== null)

      const reviewsByOrderId: Record<number, EventReviews> = {}
      allReviews.forEach((r) => {
        if (r.order_id !== null) {
          reviewsByOrderId[r.order_id] = r
        }
      })

      setBookings(rows)
      setReviews(reviewsByOrderId)
      setIsLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user])

  const now = new Date()

  const upcomingOrOngoing = bookings.filter(
    ({ event }) => new Date(event.end_time) >= now,
  )
  const past = bookings.filter(
    ({ event }) => new Date(event.end_time) < now,
  )

  const isOngoing = (event: Events) => {
    const start = new Date(event.start_time)
    const end = new Date(event.end_time)
    return now >= start && now <= end
  }

  const openRatingModal = (orderId: number) => {
    setRatingOrderId(orderId)
    setRatingValue(0)
    setCommentValue('')
  }

  const closeRatingModal = () => {
    setRatingOrderId(null)
  }

  const submitRating = async () => {
    if (ratingOrderId === null || ratingValue === 0) return

    setIsSubmittingReview(true)
    try {
      const newReview = await apiPost<EventReviews>('/event-reviews', {
        order_id: ratingOrderId,
        rating: ratingValue,
        comment: commentValue || null,
      })

      setReviews((prev) => ({ ...prev, [ratingOrderId]: newReview }))
      closeRatingModal()
    } catch (err) {
      console.error('Failed to submit review', err)
    } finally {
      setIsSubmittingReview(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center text-text-secondary text-sm">
        Please log in to see your bookings.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center text-text-secondary text-sm">
        Loading your bookings...
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-12">
      {/* Upcoming / Ongoing */}
      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Upcoming & Ongoing
        </h2>

        {upcomingOrOngoing.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-8 text-center text-sm text-text-secondary">
            No upcoming bookings yet.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingOrOngoing.map(({ order, event }) => (
              <div
                key={order.id}
                className="flex items-center justify-between bg-surface border border-border rounded-xl p-4"
              >
                <div>
                  <p className="font-semibold text-text-primary flex items-center gap-2">
                    {event.title}
                    {isOngoing(event) && (
                      <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                        Ongoing
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-text-secondary">{event.venue}</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/ticket/${order.id}`)}
                >
                  Tickets
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Past</h2>

        {past.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-8 text-center text-sm text-text-secondary">
            No past bookings yet.
          </div>
        ) : (
          <div className="space-y-3">
            {past.map(({ order, event }) => {
              const existingReview = reviews[order.id]
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between bg-surface border border-border rounded-xl p-4"
                >
                  <div>
                    <p className="font-semibold text-text-primary">{event.title}</p>
                    <p className="text-xs text-text-secondary">{event.venue}</p>
                  </div>

                  {existingReview ? (
                <div className="flex items-center gap-2">
                  <StarRating mode="read" rating={existingReview.rating} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRatingOrderId(order.id)
                      setRatingValue(existingReview.rating)
                      setCommentValue(existingReview.comment ?? '')
                    }}
                  >
                    Edit
                  </Button>
                </div>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => openRatingModal(order.id)}>
                    Rate
                  </Button>
                )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Rating Modal */}
      <Modal isOpen={ratingOrderId !== null} onClose={closeRatingModal}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Rate this event</h3>

          <StarRating mode="input" rating={ratingValue} onChange={setRatingValue} />

          <textarea
            value={commentValue}
            onChange={(e) => setCommentValue(e.target.value)}
            placeholder="Share your thoughts (optional)"
            rows={3}
            className="w-full bg-surface-alt border border-border rounded-md p-3 text-sm text-text-primary placeholder:text-text-secondary outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={closeRatingModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={ratingValue === 0}
              isLoading={isSubmittingReview}
              onClick={submitRating}
            >
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}