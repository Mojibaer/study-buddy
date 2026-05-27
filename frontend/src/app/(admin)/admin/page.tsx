import {getTranslations} from 'next-intl/server'

import {AdminPageHeader} from '@/components/admin/AdminPageHeader'
import {UsersContainer} from '@/components/admin/users/UsersContainer'

export default async function AdminUsersPage() {
    const t = await getTranslations('admin.users')
    return (
        <div className="flex flex-col gap-6">
            <AdminPageHeader title={t('title')} subtitle={t('subtitle')}/>
            <UsersContainer/>
        </div>
    )
}