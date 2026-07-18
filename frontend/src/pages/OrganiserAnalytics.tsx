import { useMemo } from 'react';
import { useAuth } from '../context';
import { eventsFixture, ordersFixture, eventReviewsFixture } from '../lib/fixtures';
import { StatCard } from '../components/ui/StatCard';
import { LineChart } from '../components/ui/LineChart';
import { BarChart } from '../components/ui/BarChart';

function computeTrend(buckets: { label: string; value: number }[]) {
  if (buckets.length < 2) return undefined;
  const prev = buckets[buckets.length - 2].value;
  const curr = buckets[buckets.length - 1].value;
  if (prev === 0) return undefined;
  const pctChange = ((curr - prev) / prev) * 100;
  return {
    value: Number(Math.abs(pctChange).toFixed(1)),
    isPositive: pctChange >= 0,
    durationLabel: 'vs last month',
  };
}

export function OrganiserAnalytics() {
  const { user } = useAuth();

  // 1. Filter events matching the logged-in organiser ID array
  const myEvents = useMemo(
    () => eventsFixture.filter((e) => user != null && e.organiser_id.includes(user.user_id)),
    [user],
  );
  
  const myEventIds = useMemo(() => new Set(myEvents.map((e) => e.id)), [myEvents]);

  // 2. Filter target orders tied directly to the organiser's events
  const myOrders = useMemo(
    () => ordersFixture.filter((o) => myEventIds.has(o.event_id) && o.payment_status === 'SUCCESS'),
    [myEventIds],
  );

  const totalEvents = myEvents.length;

  // 3. Compute structural proxy metric for "Foot Fall" based on ticket counts
  // Mapping directly to the array dimension lengths of `ticket_type_ids` per order
  const footFall = useMemo(
    () => myOrders.reduce((sum, o) => sum + (o.ticket_type_ids?.length || 0), 0),
    [myOrders],
  );

  // 4. Calculate total calculated revenue mapping strings/decimals to safe floats
  const revenue = useMemo(
    () => myOrders.reduce((sum, o) => sum + Number(o.total_amount), 0),
    [myOrders],
  );

  // 5. Gather ratings linking reviews matching the organiser's transaction ecosystem
  const myOrderIds = useMemo(() => new Set(myOrders.map((o) => o.id)), [myOrders]);
  
  
  const myReviews = useMemo(
  () => eventReviewsFixture.filter((r) => r.order_id !== null && myOrderIds.has(r.order_id)),
  [myOrderIds],
);

  
  const rating =
    myReviews.length > 0
      ? (myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length).toFixed(1)
      : '—';

  // 6. Aggregate analytics breakdowns chronologically
  const revenueByMonth = useMemo(() => {
    const buckets = new Map<string, number>();
    for (const o of myOrders) {
      const label = new Date(o.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });
      buckets.set(label, (buckets.get(label) ?? 0) + Number(o.total_amount));
    }
    return Array.from(buckets, ([label, value]) => ({ label, value }));
  }, [myOrders]);

  const revenueTrend = useMemo(() => computeTrend(revenueByMonth), [revenueByMonth]);

  // 7. Calculate Top 5 performer lists
  const topEvents = useMemo(
    () =>
      myEvents
        .map((e) => ({
          label: e.title,
          value: myOrders
            .filter((o) => o.event_id === e.id)
            .reduce((sum, o) => sum + Number(o.total_amount), 0),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [myEvents, myOrders],
  );

  return (
    <section className="mx-auto max-w-5xl space-y-8">
      <div className="rounded-2xl border border-border bg-surface p-8">
        <h1 className="text-3xl font-bold text-text-primary">Analytics and Reports</h1>
        <p className="mt-2 text-text-secondary">speaking in numbers...</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Events" value={totalEvents} />
        <StatCard label="Foot Fall" value={footFall} />
        <StatCard
          label="Revenue"
          value={`₹${revenue.toLocaleString('en-IN')}`}
          trend={revenueTrend}
        />
        <StatCard label="Rating" value={rating} />
      </div>

      <div>
        <h2 className="mb-1 text-lg font-semibold text-text-primary">Insights</h2>
        <p className="mb-3 text-sm text-text-secondary">understanding needs & wants</p>
      </div>

      <div>
        <h2 className="mb-1 text-lg font-semibold text-text-primary">Graphs</h2>
        <p className="mb-3 text-sm text-text-secondary">visualize whats going on</p>
        <div className="mb-2 text-sm font-medium text-text-primary">Revenue</div>
        <LineChart data={revenueByMonth} height={260} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-text-primary">Top 5 performing Events</h2>
        <BarChart data={topEvents} height={280} />
      </div>
    </section>
  );
}

export default OrganiserAnalytics;
