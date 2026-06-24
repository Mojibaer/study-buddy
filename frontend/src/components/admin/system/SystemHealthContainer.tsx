'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminSystemHealth } from '@/hooks/admin/useAdminSystemHealth'
import { cn } from '@/lib/utils'

export function SystemHealthContainer() {
    const t = useTranslations('admin.system')
    const { data, loading, error, refresh } = useAdminSystemHealth()

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>{t('errors.loadTitle')}</AlertTitle>
                <AlertDescription className="flex items-center gap-3">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => void refresh()}
                        className="underline underline-offset-4 hover:no-underline"
                    >
                        {t('errors.retry')}
                    </button>
                </AlertDescription>
            </Alert>
        )
    }

    if (loading || !data) {
        return <p className="text-muted-foreground">{t('states.loading')}</p>
    }

    const sync = data.document_sync

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => void refresh()}
                    className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                    <RefreshCw className="size-4" />
                    {t('refresh')}
                </button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('services.title')}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                    {data.services.map((service) => (
                        <div
                            key={service.name}
                            className={cn(
                                'flex items-start gap-3 rounded-lg border p-3',
                                service.status === 'up'
                                    ? 'border-green-600/30 bg-green-600/5'
                                    : 'border-destructive/30 bg-destructive/5',
                            )}
                        >
                            {service.status === 'up' ? (
                                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
                            ) : (
                                <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                            )}
                            <div className="min-w-0">
                                <p className="font-medium capitalize">{service.name}</p>
                                <p
                                    className={cn(
                                        'text-sm',
                                        service.status === 'up' ? 'text-green-600' : 'text-destructive',
                                    )}
                                >
                                    {t(`services.status.${service.status}`)}
                                </p>
                                {service.detail && (
                                    <p className="mt-1 break-words text-xs text-muted-foreground">{service.detail}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        {t('sync.title')}
                        <span
                            className={cn(
                                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                                sync.in_sync
                                    ? 'bg-green-600/10 text-green-600'
                                    : 'bg-destructive/10 text-destructive',
                            )}
                        >
                            {t(sync.in_sync ? 'sync.inSync' : 'sync.outOfSync')}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                    <SyncStat label={t('sync.postgres')} value={sync.postgres_documents} />
                    <SyncStat label={t('sync.weaviate')} value={sync.weaviate_documents ?? '—'} />
                    <SyncStat
                        label={t('sync.unindexed')}
                        value={sync.unindexed_documents}
                        highlight={sync.unindexed_documents > 0}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('stuck.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.stuck_unverified_accounts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t('stuck.empty')}</p>
                    ) : (
                        <ul className="divide-y divide-border">
                            {data.stuck_unverified_accounts.map((account) => (
                                <li key={account.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                                    <span className="truncate">{account.email}</span>
                                    <span className="shrink-0 text-muted-foreground">
                                        {new Date(account.created_at).toLocaleDateString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function SyncStat({
    label,
    value,
    highlight,
}: {
    label: string
    value: number | string
    highlight?: boolean
}) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={cn('text-2xl font-semibold tracking-tight', highlight && 'text-destructive')}>{value}</p>
        </div>
    )
}
