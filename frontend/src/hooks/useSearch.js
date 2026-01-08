'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    semester_id: null,
    subject_id: null,
    category_id: null
  })

  const handleSearch = async (searchQuery = query) => {
    const trimmedQuery = searchQuery.trim()

    if (!trimmedQuery) return

    setLoading(true)
    setError(null)

    try {
      const data = await api.search(trimmedQuery, {
        limit: 20,
        ...filters
      })
      setResults(data)
    } catch (err) {
      setError(err.message)
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
      category_id: null
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