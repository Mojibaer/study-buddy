'use client'

import {
    MailCheck,
    MoreHorizontal,
    Power,
    PowerOff,
    Shield,
    ShieldOff,
    Trash2,
} from 'lucide-react'
import {useState} from 'react'
import {useTranslations} from 'next-intl'

import {Button} from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {ConfirmActionDialog} from '@/components/admin/users/ConfirmActionDialog'
import type {AdminUserUpdate} from '@/lib/admin/usersClient'
import type {User} from '@/types/auth'

type PendingAction = 'deactivate' | 'activate' | 'promote' | 'demote' | 'delete' | null

interface UserRowActionsProps {
    user: User
    isSelf: boolean
    onUpdate: (id: number, body: AdminUserUpdate) => Promise<void>
    onResendVerification: (id: number) => Promise<void>
    onDelete: (id: number) => Promise<void>
}

export function UserRowActions({
                                   user,
                                   isSelf,
                                   onUpdate,
                                   onResendVerification,
                                   onDelete,
                               }: UserRowActionsProps) {
    const t = useTranslations('admin.users')
    const tActions = useTranslations('admin.actions')
    const [pending, setPending] = useState<PendingAction>(null)

    const isAdmin = user.role === 'admin'
    const isVerified = user.email_verified_at !== null
    const canResendVerification = !isVerified

    const close = () => setPending(null)

    const dialogProps = (action: Exclude<PendingAction, null>) => {
        switch (action) {
            case 'deactivate':
                return {
                    title: t('confirm.deactivate.title'),
                    description: t('confirm.deactivate.description', {email: user.email}),
                    confirmLabel: t('confirm.deactivate.confirm'),
                    variant: 'destructive' as const,
                    run: () => onUpdate(user.id, {is_active: false}),
                }
            case 'activate':
                return {
                    title: t('confirm.activate.title'),
                    description: t('confirm.activate.description', {email: user.email}),
                    confirmLabel: t('confirm.activate.confirm'),
                    variant: 'default' as const,
                    run: () => onUpdate(user.id, {is_active: true}),
                }
            case 'promote':
                return {
                    title: t('confirm.promote.title'),
                    description: t('confirm.promote.description', {email: user.email}),
                    confirmLabel: t('confirm.promote.confirm'),
                    variant: 'default' as const,
                    run: () => onUpdate(user.id, {role: 'admin'}),
                }
            case 'demote':
                return {
                    title: t('confirm.demote.title'),
                    description: t('confirm.demote.description', {email: user.email}),
                    confirmLabel: t('confirm.demote.confirm'),
                    variant: 'destructive' as const,
                    run: () => onUpdate(user.id, {role: 'student'}),
                }
            case 'delete':
                return {
                    title: t('confirm.delete.title'),
                    description: t('confirm.delete.description', {email: user.email}),
                    confirmLabel: t('confirm.delete.confirm'),
                    variant: 'destructive' as const,
                    run: () => onDelete(user.id),
                }
        }
    }

    const current = pending ? dialogProps(pending) : null

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={t('actions.menu')}>
                        <MoreHorizontal className="size-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{tActions('label')}</DropdownMenuLabel>
                    <DropdownMenuSeparator/>

                    {canResendVerification && (
                        <DropdownMenuItem onSelect={() => void onResendVerification(user.id)}>
                            <MailCheck className="size-4"/>
                            {t('actions.resendVerification')}
                        </DropdownMenuItem>
                    )}

                    {user.is_active ? (
                        <DropdownMenuItem
                            disabled={isSelf}
                            onSelect={() => setPending('deactivate')}
                        >
                            <PowerOff className="size-4"/>
                            {t('actions.deactivate')}
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem onSelect={() => setPending('activate')}>
                            <Power className="size-4"/>
                            {t('actions.activate')}
                        </DropdownMenuItem>
                    )}

                    {isAdmin ? (
                        <DropdownMenuItem
                            disabled={isSelf}
                            onSelect={() => setPending('demote')}
                        >
                            <ShieldOff className="size-4"/>
                            {t('actions.demote')}
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem onSelect={() => setPending('promote')}>
                            <Shield className="size-4"/>
                            {t('actions.promote')}
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator/>
                    <DropdownMenuItem
                        variant="destructive"
                        disabled={isSelf}
                        onSelect={() => setPending('delete')}
                    >
                        <Trash2 className="size-4"/>
                        {t('actions.delete')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {current && (
                <ConfirmActionDialog
                    open={pending !== null}
                    onOpenChange={(open) => {
                        if (!open) close()
                    }}
                    title={current.title}
                    description={current.description}
                    confirmLabel={current.confirmLabel}
                    variant={current.variant}
                    onConfirm={current.run}
                />
            )}
        </>
    )
}