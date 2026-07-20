import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import QRCode from 'react-qr-code'
import { apiGet } from '../lib/api'
import { eventsFixture } from '../lib/fixtures/events.ts'
import { ticketTypesFixture } from '../lib/fixtures/ticketTypes.ts'
import { Button } from '../components/ui/Button'
import type { Orders } from '../types/orders'
import type { OrderItems } from '../types/order_items'

export function TicketConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()

  const [order, setOrder] = React.useState<Orders | null>(null)
  const [orderItems, setOrderItems] = React.useState<OrderItems[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function loadOrder() {
      if (!orderId) return
      setIsLoading(true)
      setError(null)

      try {
        const numericOrderId = orderId ? Number(orderId) : NaN
        const allOrders = await apiGet<Orders[]>('/orders')
        const fetchedOrder = allOrders.find((o) => o.id === numericOrderId)

        if (!fetchedOrder) {
          throw new Error('Order not found')
        }

        const allOrderItems = await apiGet<OrderItems[]>('/order-items')
        const matchingItems = allOrderItems.filter(
          (item) => item.order_id === fetchedOrder.id,
        )

        if (!cancelled) {
          setOrder(fetchedOrder)
          setOrderItems(matchingItems)
        }
      } catch (err) {
        console.error('Failed to load order', err)
        if (!cancelled) {
          setError('Could not load this ticket. It may not exist.')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadOrder()
    return () => {
      cancelled = true
    }
  }, [orderId])

  const event = React.useMemo(() => {
    if (!order) return undefined
    return eventsFixture.find((e) => e.id === order.event_id)
  }, [order])

  const lineItems = React.useMemo(() => {
    return orderItems.map((item) => {
      const tier = ticketTypesFixture.find((t) => t.id === item.ticket_type_id)
      return {
        id: item.id,
        name: tier?.name ?? 'Unknown tier',
        quantity: item.quantity,
      }
    })
  }, [orderItems])

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center text-text-secondary text-sm">
        Loading your ticket...
      </div>
    )
  }

  if (error || !order || !event) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Ticket not found
        </h2>
        <p className="text-text-secondary text-sm mb-6">
          {error ?? 'This order could not be found.'}
        </p>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    )
  }

  const formattedDate = new Date(event.start_time).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <div className="max-w-2xl mx-auto pb-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-text-primary">Booking Confirmed 🎉</h1>
        <p className="text-sm text-text-secondary">
          Order #{order.id} · Access Code:{' '}
          <span className="font-mono text-text-primary">{order.access_code}</span>
        </p>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-3 bg-surface border border-border rounded-xl p-6">
        <QRCode value={order.access_code} size={180} />
        <p className="text-xs text-text-secondary font-mono">{order.access_code}</p>
      </div>

      {/* Event summary (same pattern as EventDetailPage) */}
      <div className="flex items-center gap-4 bg-surface border border-border rounded-xl p-4">
        {event.banner_url && (
          <img
            src={event.banner_url}
            alt={event.title}
            className="w-20 h-20 rounded-lg object-cover border border-border"
          />
        )}
        <div>
          <h2 className="text-lg font-bold text-text-primary">{event.title}</h2>
          <p className="text-sm text-text-secondary font-mono">{formattedDate}</p>
          <p className="text-sm text-text-secondary">{event.venue}</p>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-text-primary mb-2">
          Tickets
        </h2>
        <ul className="text-sm text-text-secondary space-y-1">
          {lineItems.map((item) => (
            <li key={item.id}>
              {item.quantity}× {item.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Things to know (same pattern as EventDetailPage) */}
      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-3">
          Things to know
        </h2>
        {event.imp_info && event.imp_info.length > 0 ? (
          <ul className="list-disc list-inside space-y-1.5 text-sm text-text-secondary">
            {event.imp_info.map((info, idx) => (
              <li key={idx}>{info}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-secondary/70">
            No additional information provided for this event.
          </p>
        )}
      </section>
    </div>
  )
}