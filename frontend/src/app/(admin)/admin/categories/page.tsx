import { getTranslations } from 'next-intl/server'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

export default async function AdminCategoriesPage() {
    const t = await getTranslations('admin.categories')
    return <AdminPageHeader title={t('title')} subtitle={t('subtitle')} />
}