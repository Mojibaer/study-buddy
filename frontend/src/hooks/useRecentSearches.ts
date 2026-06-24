'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'studybuddy.recentSearches'
const MAX_ENTRIES = 6

function read(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/**
 * Persists the user's recent search terms in localStorage (newest first,
 * deduplicated, capped). Empty until the user runs their first search.
 */
export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([])

  // Hydrate after mount to avoid SSR/client mismatch.
  useEffect(() => {
    setRecent(read())
  }, [])

  const add = useCallback((term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(
        0,
        MAX_ENTRIES,
      )
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore quota / availability errors
      }
      return next
    })
  }, [])

  const remove = useCallback((term: string) => {
    setRecent((prev) => {
      const next = prev.filter((t) => t !== term)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  const clear = useCallback(() => {
    setRecent([])
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  return { recent, add, remove, clear }
}
