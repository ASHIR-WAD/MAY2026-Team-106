import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { eventsFixture } from '../lib/fixtures/events.ts'
import { ticketTypesFixture } from '../lib/fixtures/ticketTypes.ts'
import { useAuth } from '../context'
import { apiPost } from '../lib/api'
import { QuantityStepper } from '../components/ui/QuantityStepper'
import { Button } from '../components/ui/Button'
import type { Orders, PaymentStatus } from '../types/orders'
import type { OrderItems } from '../types/order_items'

export function ChooseTicketsPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const numericEventId = eventId ? Number(eventId) : NaN

  const event = React.useMemo(() => {
    if (Number.isNaN(numericEventId)) return undefined
    return eventsFixture.find((e) => e.id === numericEventId)
  }, [numericEventId])

  const eventTicketTypes = React.useMemo(() => {
    if (!event) return []
    return ticketTypesFixture.filter((t) => t.event_id === event.id)
  }, [event])

  // quantities keyed by ticket_type id
  const [quantities, setQuantities] = React.useState<Record<number, number>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const getQuantity = (ticketTypeId: number) => quantities[ticketTypeId] ?? 0

  const handleQuantityChange = (ticketTypeId: number, next: number) => {
    setQuantities((prev) => ({ ...prev, [ticketTypeId]: next }))
  }

  const totalQuantity = React.useMemo(
    () => Object.values(quantities).reduce((sum, q) => sum + q, 0),
    [quantities],
  )

  const totalAmount = React.useMemo(() => {
    return eventTicketTypes.reduce((sum, tier) => {
      const qty = getQuantity(tier.id)
      return sum + qty * tier.price
    }, 0)
  }, [eventTicketTypes, quantities])

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Event not found
        </h2>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    )
  }

  const handleBookTickets = async () => {
    if (!user || totalQuantity === 0) return

    setIsSubmitting(true)
    setError(null)

    try {
      const selectedTiers = eventTicketTypes
        .map((tier) => ({ tier, quantity: getQuantity(tier.id) }))
        .filter(({ quantity }) => quantity > 0)

      const accessCode = crypto.randomUUID()

      // 1. Create the order (PENDING)
      const order = await apiPost<Orders>('/orders', {
        attendee_id: user.user_id,
        event_id: event.id,
        total_amount: totalAmount,
        payment_status: 'PENDING' as PaymentStatus,
        access_code: accessCode,
      })

      // 2. Create one order_items row per selected tier
      await Promise.all(
        selectedTiers.map(({ tier, quantity }) =>
          apiPost<OrderItems>('/order-items', {
            order_id: order.id,
            ticket_type_id: tier.id,
            quantity,
            unit_price: tier.price,
            subtotal: tier.price * quantity,
          }),
        ),
      )

      // 3. Mark order SUCCESS + bump quantity_sold per tier
      await apiPost<Orders>('/orders/update-status', {
        orderId: order.id,
        payment_status: 'SUCCESS' as PaymentStatus,
      })


      await Promise.all(
        selectedTiers.map(({ tier, quantity }) =>
          apiPost('/ticket-types/update-sold', {
          ticketTypeId: tier.id,
          quantity,
        }),
        ),
      )

      navigate(`/ticket/${order.id}`)
    } catch (err) {
      console.error('Booking failed', err)
      setError('Something went wrong while processing your booking. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Event summary */}
      <div className="flex items-center gap-4 bg-surface border border-border rounded-xl p-4 mb-8">
        {event.banner_url && (
          <img
            src={event.banner_url}
            alt={event.title}
            className="w-20 h-20 rounded-lg object-cover border border-border"
          />
        )}
        <div>
          <h1 className="text-lg font-bold text-text-primary">{event.title}</h1>
          <p className="text-sm text-text-secondary">{event.venue}</p>
        </div>
      </div>

      {/* Ticket tiers */}
      <div className="space-y-4 mb-8">
        {eventTicketTypes.map((tier) => {
          const remaining = tier.quantity_total - tier.quantity_sold
          const isSoldOut = remaining <= 0

          return (
            <div
              key={tier.id}
              className="flex items-center justify-between bg-surface border border-border rounded-xl p-4"
            >
              <div>
                <p className="font-semibold text-text-primary">{tier.name}</p>
                <p className="text-sm text-text-secondary">
                  ₹{tier.price} {isSoldOut && (
                    <span className="text-red-500 font-medium ml-2">Sold Out</span>
                  )}
                </p>
              </div>

              {!isSoldOut && (
                <QuantityStepper
                  value={getQuantity(tier.id)}
                  onChange={(next) => handleQuantityChange(tier.id, next)}
                  min={0}
                  max={remaining}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Running total + book button */}
      <div className="flex items-center justify-between bg-surface border border-border rounded-xl p-4 mb-4">
        <div>
          <p className="text-xs text-text-secondary uppercase tracking-wide mb-0.5">
            Total ({totalQuantity} ticket{totalQuantity !== 1 ? 's' : ''})
          </p>
          <p className="text-lg font-semibold text-text-primary">₹{totalAmount}</p>
        </div>
        <Button
          variant="primary"
          disabled={totalQuantity === 0 || isSubmitting}
          isLoading={isSubmitting}
          onClick={handleBookTickets}
        >
          Book Tickets
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  )
}