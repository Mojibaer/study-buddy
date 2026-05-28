'use client'

import {useTranslations} from 'next-intl'

import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert'
import {UsersToolbar} from '@/components/admin/users/UsersToolbar'
import {UsersTable} from '@/components/admin/users/UsersTable'
import {useAdminUsers} from '@/hooks/admin/useAdminUsers'
import {useAuth} from '@/providers/AuthProvider'

export function UsersContainer() {
    const t = useTranslations('admin.users')
    const {user} = useAuth()
    const {
        users,
        loading,
        error,
        filter,
        setFilter,
        refresh,
        updateUser,
        resendVerification,
        deleteUser,
    } = useAdminUsers()

    const wrappedUpdate = async (id: number, body: Parameters<typeof updateUser>[1]) => {
        await updateUser(id, body)
    }

    const wrappedResend = async (id: number) => {
        await resendVerification(id)
    }

    const wrappedDelete = async (id: number) => {
        await deleteUser(id)
    }

    return (
        <div className="flex flex-col gap-6">
            <UsersToolbar filter={filter} onFilterChange={setFilter}/>

            {error && (
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
            )}

            {loading ? (
                <p className="text-muted-foreground">{t('states.loading')}</p>
            ) : users.length === 0 ? (
                <p className="text-muted-foreground">{t('states.empty')}</p>
            ) : (
                <UsersTable
                    users={users}
                    currentUserId={user?.id ?? null}
                    onUpdate={wrappedUpdate}
                    onResendVerification={wrappedResend}
                    onDelete={wrappedDelete}
                />
            )}
        </div>
    )
}