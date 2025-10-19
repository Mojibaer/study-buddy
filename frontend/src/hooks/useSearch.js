'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (searchQuery = query, options = {}) => {
    const trimmedQuery = searchQuery.trim()

    if (!trimmedQuery) return

    setLoading(true)
    setError(null)

    try {
      const data = await api.search(trimmedQuery, {
        limit: 20,
        ...options
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
  }

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    handleSearch,
    resetSearch,
  }
}