import { getTranslations } from 'next-intl/server'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { DocumentsContainer } from '@/components/admin/documents/DocumentsContainer'

export default async function AdminDocumentsPage() {
    const t = await getTranslations('admin.documents')
    return (
        <div className="flex flex-col gap-6">
            <AdminPageHeader title={t('title')} subtitle={t('subtitle')} />
            <DocumentsContainer />
        </div>
    )
}