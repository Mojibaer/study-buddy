'use client'

import { useCallback, useState } from 'react'
import { api } from '@/api/client'
import { SEARCH_LIMIT } from '@/lib/constants'
import type { SearchFilters, SearchResponse } from '@/types'

const EMPTY_FILTERS: SearchFilters = {
  semester_id: null,
  subject_id: null,
  category_id: null,
}

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS)

  // Run a search for the given query + filters. Both are passed explicitly so a
  // filter change can re-search immediately without waiting for state to settle.
  const runSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters) => {
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) return

    setLoading(true)
    setError(null)
    try {
      const data = await api.search(trimmedQuery, { limit: SEARCH_LIMIT, ...searchFilters })
      setResults(data)
    } catch (err) {
      setError((err as Error).message)
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = useCallback(
    (searchQuery = query) => runSearch(searchQuery, filters),
    [query, filters, runSearch],
  )

  // Change filters and immediately re-search with the active query.
  const applyFilters = useCallback(
    (next: SearchFilters) => {
      setFilters(next)
      void runSearch(query, next)
    },
    [query, runSearch],
  )

  const resetSearch = useCallback(() => {
    setQuery('')
    setResults(null)
    setError(null)
    setFilters(EMPTY_FILTERS)
  }, [])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    filters,
    setFilters,
    applyFilters,
    handleSearch,
    resetSearch,
  }
}
