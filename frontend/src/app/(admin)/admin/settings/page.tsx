import { getTranslations } from 'next-intl/server'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { SystemHealthContainer } from '@/components/admin/system/SystemHealthContainer'

export default async function AdminSystemPage() {
    const t = await getTranslations('admin.system')
    return (
        <div className="flex flex-col gap-6">
            <AdminPageHeader title={t('title')} subtitle={t('subtitle')} />
            <SystemHealthContainer />
        </div>
    )
}
