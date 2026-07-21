import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context'
import { eventsFixture } from '../lib/fixtures'
import { EventCard } from '../components/event/EventCard'

export function HomePage() {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [searchLocation, setSearchLocation] = useState('')
  const [filterQuery, setFilterQuery] = useState('')

  // Filter events based on search query
  const filteredEvents = eventsFixture.filter((event) => {
    if (event.status !== 'ACTIVE') return false
    if (!filterQuery) return true
    const q = filterQuery.trim().toLowerCase()
    if (!q) return true
    return (
      event.title.toLowerCase().includes(q) ||
      event.venue.toLowerCase().includes(q) ||
      (event.description ?? "").toLowerCase().includes(q)
    )
  })

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFilterQuery(searchLocation)
  }

  const toggleBookmark = (eventId: number) => {
    if (!user) {
      navigate('/auth/login')
      return
    }

    const currentBookmarks = user.bookmarks || []
    const nextBookmarks = currentBookmarks.includes(eventId)
      ? currentBookmarks.filter((id) => id !== eventId)
      : [...currentBookmarks, eventId]

    updateProfile({ bookmarks: nextBookmarks })
  }

  return (
    <div className="space-y-12 pb-16">
      {/* Hero section */}
      <div className="relative flex flex-col items-center justify-center pt-10 pb-6 text-center px-4">
        {/* Visual background gradient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-3xl space-y-6 relative z-10">
          <div>
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-text-primary">
              Gatherly
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary mt-2 font-medium italic">
              Your gateway to live events and experiences
            </p>
          </div>

          {/* Location search bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-lg mx-auto w-full">
            <div className="relative flex items-center bg-surface border border-border rounded-full p-1.5 shadow-lg shadow-black/[0.03] focus-within:ring-2 focus-within:ring-accent transition-all">
              <span className="pl-3 text-text-secondary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search city, venue or location (e.g. Gurugram)..."
                className="w-full bg-transparent border-none outline-none px-3 text-sm text-text-primary placeholder:text-text-secondary"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
              <button
                type="submit"
                className="bg-accent text-white rounded-full p-2.5 hover:bg-accent/90 transition-all transform active:scale-95 shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </button>
            </div>
          </form>

          {/* Action buttons (only for guest users) */}
          {!user && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                to="/auth/signup"
                className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 transition-all shadow-md shadow-accent/15 transform active:scale-95"
              >
                Register
              </Link>
              <Link
                to="/auth/login"
                className="rounded-xl border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-text-primary hover:bg-surface-alt transition-colors"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Events section */}
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
            {filterQuery ? `Events in "${filterQuery}"` : 'Events in your area'}
          </h2>
          <span className="text-xs text-text-secondary font-medium">
            Showing {filteredEvents.length} active event{filteredEvents.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-10 h-10 text-text-secondary/50"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
              />
            </svg>
            <p className="text-sm font-semibold text-text-primary">No events found</p>
            <button
              onClick={() => {
                setSearchLocation('')
                setFilterQuery('')
              }}
              className="text-xs text-accent hover:underline font-medium"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const isBookmarked = user?.bookmarks?.includes(event.id)
              return (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  bannerUrl={event.banner_url}
                  dateString={new Date(event.start_time).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  locationString={event.venue}
                  isBookmarked={isBookmarked}
                  onBookmarkToggle={() => toggleBookmark(event.id)}
                  onNavigate={(id) => navigate(`/event/${id}`)}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
