import { getTranslations } from 'next-intl/server'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

export default async function AdminUsersPage() {
    const t = await getTranslations('admin.users')
    return <AdminPageHeader title={t('title')} subtitle={t('subtitle')} />
}