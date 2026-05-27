'use client'

import {useFormatter, useTranslations} from 'next-intl'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    ActiveBadge,
    RoleBadge,
    VerifiedBadge,
} from '@/components/admin/users/UserStatusBadges'
import {UserRowActions} from '@/components/admin/users/UserRowActions'
import type {AdminUserUpdate} from '@/lib/admin/usersClient'
import type {User} from '@/types/auth'

interface UsersTableProps {
    users: User[]
    currentUserId: number | null
    onUpdate: (id: number, body: AdminUserUpdate) => Promise<void>
    onResendVerification: (id: number) => Promise<void>
    onDelete: (id: number) => Promise<void>
}

export function UsersTable({
                               users,
                               currentUserId,
                               onUpdate,
                               onResendVerification,
                               onDelete,
                           }: UsersTableProps) {
    const t = useTranslations('admin.users.table')
    const format = useFormatter()

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('user')}</TableHead>
                        <TableHead>{t('role')}</TableHead>
                        <TableHead>{t('status')}</TableHead>
                        <TableHead>{t('verification')}</TableHead>
                        <TableHead>{t('createdAt')}</TableHead>
                        <TableHead className="w-12 text-right">
                            <span className="sr-only">{t('actions')}</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-medium">{user.username ?? t('unnamed')}</span>
                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <RoleBadge role={user.role}/>
                            </TableCell>
                            <TableCell>
                                <ActiveBadge isActive={user.is_active}/>
                            </TableCell>
                            <TableCell>
                                <VerifiedBadge user={user}/>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {format.dateTime(new Date(user.created_at), {
                                    dateStyle: 'medium',
                                })}
                            </TableCell>
                            <TableCell className="text-right">
                                <UserRowActions
                                    user={user}
                                    isSelf={user.id === currentUserId}
                                    onUpdate={onUpdate}
                                    onResendVerification={onResendVerification}
                                    onDelete={onDelete}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}