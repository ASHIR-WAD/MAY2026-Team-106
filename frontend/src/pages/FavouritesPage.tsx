import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context'
import { userFollowsFixture, usersFixture, eventsFixture } from '../lib/fixtures'
import { EventCard } from '../components/event/EventCard'
import { useBookmark } from '../hooks/useBookmark'

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function FavouritesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isBookmarked, toggleBookmark } = useBookmark()
  // Bump on focus/mount so toggles from the OrganiserProfilePage (which
  // mutates the module-level fixture) are reflected on this page.
  const [followTick, setFollowTick] = useState(0)

  useEffect(() => {
    setFollowTick((t) => t + 1)
  }, [])

  // Section 1: Organisers you follow — from user_follows
  const followedOrganisers = useMemo(() => {
    if (!user) return []
    const followingIds = userFollowsFixture
      .filter((row) => row.follower_id === user.user_id)
      .map((row) => row.following_id)
    return usersFixture.filter(
      (u) => followingIds.includes(u.user_id) && u.role === 'ORGANISER',
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, followTick])

  // Section 2: Bookmarked events — pulled from currentUser.bookmarks array
  const bookmarkedEvents = useMemo(() => {
    if (!user) return []
    const ids = user.bookmarks ?? []
    return eventsFixture.filter((event) => ids.includes(event.id))
  }, [user])

  if (!user) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-text-primary">Favourites</h1>
        <p className="text-text-secondary mt-2">Please sign in to view your favourites.</p>
      </section>
    )
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Favourites</h1>
        <p className="text-sm text-text-secondary">
          The organisers you follow and the events you have bookmarked.
        </p>
      </header>

      {/* Bookmarked events — from currentUser.bookmarks array */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-xl font-bold text-text-primary">Bookmarked events</h2>
          <span className="text-xs text-text-secondary font-medium">
            {bookmarkedEvents.length} saved
          </span>
        </div>

        {bookmarkedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 border border-dashed border-border rounded-2xl bg-surface-alt/40">
            <span className="text-3xl opacity-60">🔖</span>
            <p className="text-sm font-semibold text-text-primary">
              No bookmarked events yet
            </p>
            <p className="text-xs text-text-secondary max-w-sm">
              Tap the star on any event to save it here for later.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-2 text-xs text-accent hover:underline font-semibold"
            >
              Find events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                bannerUrl={event.banner_url ?? null}
                dateString={formatEventDate(event.start_time)}
                locationString={event.venue}
                isBookmarked={isBookmarked(event.id)}
                onBookmarkToggle={() => toggleBookmark(event.id)}
                onNavigate={(id) => navigate(`/event/${id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Organisers you follow — from user_follows (unchanged) */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-xl font-bold text-text-primary">Organisers you follow</h2>
          <span className="text-xs text-text-secondary font-medium">
            {followedOrganisers.length} followed
          </span>
        </div>

        {followedOrganisers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 border border-dashed border-border rounded-2xl bg-surface-alt/40">
            <span className="text-3xl opacity-60">👥</span>
            <p className="text-sm font-semibold text-text-primary">
              You&apos;re not following anyone yet
            </p>
            <p className="text-xs text-text-secondary max-w-sm">
              Follow organisers to see their latest events and updates here.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-2 text-xs text-accent hover:underline font-semibold"
            >
              Browse events
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {followedOrganisers.map((org) => (
              <li
                key={org.user_id}
                className="flex items-center gap-3 p-4 border border-border bg-surface rounded-xl hover:border-accent/40 transition-colors cursor-pointer"
                onClick={() => navigate(`/organiser/${org.user_id}`)}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-alt shrink-0 flex items-center justify-center text-text-secondary text-xs font-semibold">
                  {org.pfp_url ? (
                    <img
                      src={org.pfp_url}
                      alt={org.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    org.name.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{org.name}</p>
                  {org.description && (
                    <p className="text-xs text-text-secondary line-clamp-1">{org.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
