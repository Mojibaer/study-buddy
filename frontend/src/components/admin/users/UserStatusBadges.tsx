'use client'

import {useTranslations} from 'next-intl'

import {Badge} from '@/components/ui/badge'
import type {User, UserRole} from '@/types/auth'

export function RoleBadge({role}: { role: UserRole }) {
    const t = useTranslations('admin.users.role')
    return (
        <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
            {t(role)}
        </Badge>
    )
}

export function ActiveBadge({isActive}: { isActive: boolean }) {
    const t = useTranslations('admin.users.status')
    return (
        <Badge variant={isActive ? 'outline' : 'destructive'}>
            {t(isActive ? 'active' : 'inactive')}
        </Badge>
    )
}

export function VerifiedBadge({user}: { user: User }) {
    const t = useTranslations('admin.users.status')
    const verified = user.email_verified_at !== null
    return (
        <Badge variant={verified ? 'outline' : 'secondary'}>
            {t(verified ? 'verified' : 'unverified')}
        </Badge>
    )
}