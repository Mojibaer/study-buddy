'use client'

import { useState } from 'react'
import { api } from '@/api/client'
import { SEARCH_LIMIT } from '@/lib/constants'
import type { SearchFilters, SearchResponse } from '@/types'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({
    semester_id: null,
    subject_id: null,
    category_id: null,
  })

  const handleSearch = async (searchQuery = query) => {
    const trimmedQuery = searchQuery.trim()

    if (!trimmedQuery) return

    setLoading(true)
    setError(null)

    try {
      const data = await api.search(trimmedQuery, {
        limit: SEARCH_LIMIT,
        ...filters,
      })
      setResults(data)
    } catch (err) {
      setError((err as Error).message)
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const resetSearch = () => {
    setQuery('')
    setResults(null)
    setError(null)
    setFilters({
      semester_id: null,
      subject_id: null,
      category_id: null,
    })
  }

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    filters,
    setFilters,
    handleSearch,
    resetSearch,
  }
}
