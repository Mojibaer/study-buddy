'use client'

import {useTranslations} from 'next-intl'
import {FileText, HardDrive, Users} from 'lucide-react'

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import type {AnalyticsOverview} from '@/lib/admin/analyticsClient'
import {formatBytes} from './formatBytes'

interface StatCardsProps {
    data: AnalyticsOverview
}

export function StatCards({data}: StatCardsProps) {
    const t = useTranslations('admin.analytics')

    const stats = [
        {key: 'totalDocuments', icon: FileText, value: data.total_documents.toLocaleString()},
        {key: 'totalUsers', icon: Users, value: data.total_users.toLocaleString()},
        {key: 'totalStorage', icon: HardDrive, value: formatBytes(data.total_storage_bytes)},
    ] as const

    return (
        <div className="grid gap-4 sm:grid-cols-3">
            {stats.map(({key, icon: Icon, value}) => (
                <Card key={key}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t(`stats.${key}`)}
                        </CardTitle>
                        <Icon className="size-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold tracking-tight">{value}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}