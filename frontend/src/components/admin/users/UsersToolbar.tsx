'use client'

import {Search, X} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffect, useState} from 'react'

import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type {AdminUsersFilter} from '@/lib/admin/usersClient'
import type {UserRole} from '@/types/auth'

const ANY = '__any__'
const SEARCH_DEBOUNCE_MS = 250

interface UsersToolbarProps {
    filter: AdminUsersFilter
    onFilterChange: (next: AdminUsersFilter) => void
}

export function UsersToolbar({filter, onFilterChange}: UsersToolbarProps) {
    const t = useTranslations('admin.users.toolbar')
    const [searchInput, setSearchInput] = useState(filter.search ?? '')

    useEffect(() => {
        setSearchInput(filter.search ?? '')
    }, [filter.search])

    useEffect(() => {
        const trimmed = searchInput.trim()
        const current = filter.search ?? ''
        if (trimmed === current) return
        const handle = setTimeout(() => {
            onFilterChange({...filter, search: trimmed || undefined})
        }, SEARCH_DEBOUNCE_MS)
        return () => clearTimeout(handle)
    }, [searchInput, filter, onFilterChange])

    const hasFilters =
        filter.search || filter.role || filter.is_active !== undefined || filter.is_verified !== undefined

    const setRole = (value: string) =>
        onFilterChange({...filter, role: value === ANY ? undefined : (value as UserRole)})

    const setActive = (value: string) =>
        onFilterChange({...filter, is_active: value === ANY ? undefined : value === 'true'})

    const setVerified = (value: string) =>
        onFilterChange({...filter, is_verified: value === ANY ? undefined : value === 'true'})

    const clear = () => {
        setSearchInput('')
        onFilterChange({})
    }

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative flex-1 min-w-[220px]">
                <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                <Input
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    aria-label={t('searchPlaceholder')}
                    className="pl-9"
                />
            </div>

            <Select value={filter.role ?? ANY} onValueChange={setRole}>
                <SelectTrigger className="w-[160px]" aria-label={t('roleLabel')}>
                    <SelectValue placeholder={t('roleLabel')}/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ANY}>{t('anyRole')}</SelectItem>
                    <SelectItem value="student">{t('role.student')}</SelectItem>
                    <SelectItem value="admin">{t('role.admin')}</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={filter.is_active === undefined ? ANY : String(filter.is_active)}
                onValueChange={setActive}
            >
                <SelectTrigger className="w-[160px]" aria-label={t('statusLabel')}>
                    <SelectValue placeholder={t('statusLabel')}/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ANY}>{t('anyStatus')}</SelectItem>
                    <SelectItem value="true">{t('status.active')}</SelectItem>
                    <SelectItem value="false">{t('status.inactive')}</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={filter.is_verified === undefined ? ANY : String(filter.is_verified)}
                onValueChange={setVerified}
            >
                <SelectTrigger className="w-[180px]" aria-label={t('verificationLabel')}>
                    <SelectValue placeholder={t('verificationLabel')}/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ANY}>{t('anyVerification')}</SelectItem>
                    <SelectItem value="true">{t('verification.verified')}</SelectItem>
                    <SelectItem value="false">{t('verification.unverified')}</SelectItem>
                </SelectContent>
            </Select>

            {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clear}>
                    <X className="size-4"/>
                    {t('clear')}
                </Button>
            )}
        </div>
    )
}