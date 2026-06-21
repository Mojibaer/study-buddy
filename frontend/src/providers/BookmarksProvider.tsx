'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '@/api/client'
import { useAuth } from '@/providers/AuthProvider'
import type { Document } from '@/types'

interface BookmarksContextValue {
  /** Full bookmarked documents, newest first (for the saved-sidebar). */
  documents: Document[]
  /** Fast membership check for result rows. */
  isBookmarked: (id: number) => boolean
  /** Optimistic add/remove; rolls back on API failure. */
  toggle: (document: Document) => void
  count: number
  loading: boolean
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null)

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [ids, setIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Bookmarks require auth — wait for the token bootstrap (same race as filters).
    if (status === 'loading') return
    if (status !== 'authenticated') {
      setDocuments([])
      setIds(new Set())
      setLoading(false)
      return
    }
    api.getBookmarks()
      .then((res) => {
        setDocuments(res.documents)
        setIds(new Set(res.document_ids))
      })
      .catch((err: Error) => console.error('Failed to load bookmarks:', err))
      .finally(() => setLoading(false))
  }, [status])

  const isBookmarked = useCallback((id: number) => ids.has(id), [ids])

  const toggle = useCallback((document: Document) => {
    const id = document.id
    const wasBookmarked = ids.has(id)

    // Optimistic update.
    setIds((prev) => {
      const next = new Set(prev)
      if (wasBookmarked) next.delete(id)
      else next.add(id)
      return next
    })
    setDocuments((prev) =>
      wasBookmarked ? prev.filter((d) => d.id !== id) : [document, ...prev],
    )

    const request = wasBookmarked ? api.removeBookmark(id) : api.addBookmark(id)
    request.catch((err: Error) => {
      console.error('Failed to toggle bookmark:', err)
      // Roll back on failure.
      setIds((prev) => {
        const next = new Set(prev)
        if (wasBookmarked) next.add(id)
        else next.delete(id)
        return next
      })
      setDocuments((prev) =>
        wasBookmarked ? [document, ...prev] : prev.filter((d) => d.id !== id),
      )
    })
  }, [ids])

  return (
    <BookmarksContext.Provider
      value={{ documents, isBookmarked, toggle, count: ids.size, loading }}
    >
      {children}
    </BookmarksContext.Provider>
  )
}

export function useBookmarks(): BookmarksContextValue {
  const ctx = useContext(BookmarksContext)
  if (!ctx) throw new Error('useBookmarks must be used within a BookmarksProvider')
  return ctx
}
