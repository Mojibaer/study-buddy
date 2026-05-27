import { getTranslations } from 'next-intl/server'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

export default async function AdminSettingsPage() {
    const t = await getTranslations('admin.settings')
    return <AdminPageHeader title={t('title')} subtitle={t('subtitle')} />
}