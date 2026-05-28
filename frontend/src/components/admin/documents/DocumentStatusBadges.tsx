'use client'

import { AlertTriangle, CheckCircle2, CircleSlash } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'

export function IndexedBadge({ indexed }: { indexed: boolean }) {
    const t = useTranslations('admin.documents.status')
    return indexed ? (
        <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="size-3 text-emerald-600" />
            {t('indexed')}
        </Badge>
    ) : (
        <Badge variant="secondary" className="gap-1">
            <CircleSlash className="size-3" />
            {t('notIndexed')}
        </Badge>
    )
}

export function OrphanedBadge() {
    const t = useTranslations('admin.documents.status')
    return (
        <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="size-3" />
            {t('orphaned')}
        </Badge>
    )
}