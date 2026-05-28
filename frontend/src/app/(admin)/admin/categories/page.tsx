import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { StructureContainer } from '@/components/admin/structure/StructureContainer'

export default async function AdminStructurePage() {
    const t = await getTranslations('admin.structure')
    return (
        <div className="flex flex-col gap-6">
            <AdminPageHeader title={t('title')} subtitle={t('subtitle')} />
            <Suspense fallback={<p className="text-muted-foreground">{t('states.loading')}</p>}>
                <StructureContainer />
            </Suspense>
        </div>
    )
}