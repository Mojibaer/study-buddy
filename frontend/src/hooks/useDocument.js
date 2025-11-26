'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export function useDocument(id) {
    const [document, setDocument] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchDocument = async () => {
            if (!id) return

            setLoading(true)
            setError(null)

            try {
                const data = await api.getDocument(id)
                setDocument(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchDocument()
    }, [id])

    return { document, loading, error }
}