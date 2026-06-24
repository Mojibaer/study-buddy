'use client'

import {useTranslations} from 'next-intl'

import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert'
import {useAdminAnalytics} from '@/hooks/admin/useAdminAnalytics'
import {StatCards} from './StatCards'
import {UploadActivityChart} from './UploadActivityChart'
import {SubjectCoverageChart} from './SubjectCoverageChart'

export function AnalyticsContainer() {
    const t = useTranslations('admin.analytics')
    const {data, loading, error, refresh} = useAdminAnalytics()

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

    return (
        <div className="flex flex-col gap-6">
            <StatCards data={data}/>
            <UploadActivityChart data={data.upload_activity}/>
            <SubjectCoverageChart data={data.subject_coverage}/>
        </div>
    )
}