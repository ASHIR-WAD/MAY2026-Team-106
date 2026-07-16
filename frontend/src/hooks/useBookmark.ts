import { useCallback } from 'react'
import { useAuth } from '../context'
import { apiPost } from '../lib/api'

interface UseBookmarkResult {
  isBookmarked: (eventId: number) => boolean
  toggleBookmark: (eventId: number) => void
}

export function useBookmark(): UseBookmarkResult {
  const { user, updateProfile } = useAuth()

  const isBookmarked = useCallback(
    (eventId: number) => {
      return user?.bookmarks?.includes(eventId) ?? false
    },
    [user],
  )

  const toggleBookmark = useCallback(
    (eventId: number) => {
      if (!user) return

      const current = user.bookmarks ?? []
      const isAlreadyBookmarked = current.includes(eventId)
      const next = isAlreadyBookmarked
        ? current.filter((id) => id !== eventId)
        : [...current, eventId]

      // Optimistic local update — flips the UI immediately across pages
      updateProfile({ bookmarks: next })

      // Fire-and-forget persistence
      void apiPost('/users/me/bookmarks', {
        eventId,
        bookmarked: !isAlreadyBookmarked,
      }).catch((err) => {
        // Revert on failure so the UI stays in sync with the server
        console.error('Failed to persist bookmark:', err)
        updateProfile({ bookmarks: current })
      })
    },
    [user, updateProfile],
  )

  return { isBookmarked, toggleBookmark }
}
