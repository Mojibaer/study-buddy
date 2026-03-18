'use client'

import { useState, useEffect } from 'react'
import { api } from '@/api/client'

export function useFilters() {
  const [filters, setFilters] = useState({ semesters: [], subjects: [], categories: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getFilters()
      .then(setFilters)
      .catch((err) => console.error('Fehler beim Laden der Filter:', err))
      .finally(() => setLoading(false))
  }, [])

  const getSubjectsForSemester = (semesterId) =>
    semesterId
      ? filters.subjects.filter((s) => s.semester_id === parseInt(semesterId))
      : filters.subjects

  return { filters, loading, getSubjectsForSemester }
}
