'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '@/api/client'
import { useAuth } from '@/providers/AuthProvider'
import type { FiltersResponse, Subject } from '@/types'

interface FiltersContextValue {
  filters: FiltersResponse
  loading: boolean
  getSubjectsForSemester: (semesterId: string | null) => Subject[]
}

const FiltersContext = createContext<FiltersContextValue | null>(null)

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  const [filters, setFilters] = useState<FiltersResponse>({ semesters: [], subjects: [], categories: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Filter endpoints require auth — wait for the bootstrap to restore the
    // access token, otherwise the first request races ahead and 401s.
    if (status === 'loading') return
    if (status !== 'authenticated') {
      setFilters({ semesters: [], subjects: [], categories: [] })
      setLoading(false)
      return
    }
    api.getFilters()
      .then(setFilters)
      .catch((err: Error) => console.error('Fehler beim Laden der Filter:', err))
      .finally(() => setLoading(false))
  }, [status])

  const getSubjectsForSemester = (semesterId: string | null): Subject[] =>
    semesterId
      ? filters.subjects.filter((s) => s.semester_id === parseInt(semesterId))
      : filters.subjects

  return (
    <FiltersContext.Provider value={{ filters, loading, getSubjectsForSemester }}>
      {children}
    </FiltersContext.Provider>
  )
}

export function useFilters(): FiltersContextValue {
  const ctx = useContext(FiltersContext)
  if (!ctx) throw new Error('useFilters must be used within a FiltersProvider')
  return ctx
}
