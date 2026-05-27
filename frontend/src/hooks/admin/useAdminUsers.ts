'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'

import {
    adminUsersClient,
    type AdminUserUpdate,
    type AdminUsersFilter,
} from '@/lib/admin/usersClient'
import type {User} from '@/types/auth'

interface UseAdminUsersResult {
    users: User[]
    loading: boolean
    error: string | null
    filter: AdminUsersFilter
    setFilter: (next: AdminUsersFilter) => void
    refresh: () => Promise<void>
    updateUser: (id: number, body: AdminUserUpdate) => Promise<void>
    resendVerification: (id: number) => Promise<void>
    deleteUser: (id: number) => Promise<void>
}

export function useAdminUsers(): UseAdminUsersResult {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<AdminUsersFilter>({})

    const filterKey = useMemo(() => JSON.stringify(filter), [filter])

    const load = useCallback(async (current: AdminUsersFilter) => {
        setLoading(true)
        setError(null)
        try {
            const data = await adminUsersClient.list(current)
            setUsers(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void load(JSON.parse(filterKey) as AdminUsersFilter)
    }, [filterKey, load])

    const refresh = useCallback(() => load(filter), [filter, load])

    const updateUser = useCallback(
        async (id: number, body: AdminUserUpdate) => {
            const updated = await adminUsersClient.update(id, body)
            setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
        },
        [],
    )

    const resendVerification = useCallback(async (id: number) => {
        await adminUsersClient.resendVerification(id)
    }, [])

    const deleteUser = useCallback(async (id: number) => {
        await adminUsersClient.remove(id)
        setUsers((prev) => prev.filter((u) => u.id !== id))
    }, [])

    return {
        users,
        loading,
        error,
        filter,
        setFilter,
        refresh,
        updateUser,
        resendVerification,
        deleteUser,
    }
}