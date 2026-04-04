'use client'

import { useState, useEffect } from 'react'
import { api } from '@/api/client'
import type { FiltersResponse, Subject } from '@/types'

export function useFilters() {
  const [filters, setFilters] = useState<FiltersResponse>({ semesters: [], subjects: [], categories: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getFilters()
      .then(setFilters)
      .catch((err: Error) => console.error('Fehler beim Laden der Filter:', err))
      .finally(() => setLoading(false))
  }, [])

  const getSubjectsForSemester = (semesterId: string | null): Subject[] =>
    semesterId
      ? filters.subjects.filter((s) => s.semester_id === parseInt(semesterId))
      : filters.subjects

  return { filters, loading, getSubjectsForSemester }
}
