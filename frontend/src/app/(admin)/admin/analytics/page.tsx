import { getTranslations } from 'next-intl/server'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AnalyticsContainer } from '@/components/admin/analytics/AnalyticsContainer'

export default async function AdminAnalyticsPage() {
    const t = await getTranslations('admin.analytics')
    return (
        <div className="flex flex-col gap-6">
            <AdminPageHeader title={t('title')} subtitle={t('subtitle')} />
            <AnalyticsContainer />
        </div>
    )
}