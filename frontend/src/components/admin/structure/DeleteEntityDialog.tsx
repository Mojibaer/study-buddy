'use client'

import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmActionDialog } from '@/components/admin/users/ConfirmActionDialog'

interface DeleteEntityDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    confirmLabel: string
    warning?: string
    onConfirm: () => Promise<void>
}

export function DeleteEntityDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    warning,
    onConfirm,
}: DeleteEntityDialogProps) {
    const t = useTranslations('admin.structure.delete')

    return (
        <ConfirmActionDialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={warning ? `${description}\n\n${warning}` : description}
            confirmLabel={confirmLabel}
            onConfirm={onConfirm}
            variant="destructive"
        />
    )
}

export function ContentWarning({ message }: { message: string }) {
    return (
        <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>{message}</AlertTitle>
        </Alert>
    )
}