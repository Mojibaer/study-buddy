'use client'

import { useCallback, useEffect, useState } from 'react'

import { adminSystemClient, type SystemHealth } from '@/lib/admin/systemClient'

interface UseAdminSystemHealthResult {
    data: SystemHealth | null
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
}

export function useAdminSystemHealth(): UseAdminSystemHealthResult {
    const [data, setData] = useState<SystemHealth | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            setData(await adminSystemClient.health())
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void load()
    }, [load])

    return { data, loading, error, refresh: load }
}
