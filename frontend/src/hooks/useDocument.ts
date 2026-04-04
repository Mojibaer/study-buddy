'use client'

import { useState, useEffect } from 'react'
import { api } from '@/api/client'
import type { Document } from '@/types'

export function useDocument(id: string | string[] | undefined) {
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return

      setLoading(true)
      setError(null)

      try {
        const data = await api.getDocument(Array.isArray(id) ? id[0] : id)
        setDocument(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [id])

  return { document, loading, error }
}
