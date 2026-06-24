'use client'

import { useCallback, useEffect, useState } from 'react'

import { adminAnalyticsClient, type AnalyticsOverview } from '@/lib/admin/analyticsClient'

interface UseAdminAnalyticsResult {
    data: AnalyticsOverview | null
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
}

export function useAdminAnalytics(): UseAdminAnalyticsResult {
    const [data, setData] = useState<AnalyticsOverview | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            setData(await adminAnalyticsClient.overview())
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