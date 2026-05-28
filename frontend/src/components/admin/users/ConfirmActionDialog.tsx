'use client'

import {useState} from 'react'
import {useTranslations} from 'next-intl'

import {Button} from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

type ConfirmVariant = 'destructive' | 'default'

interface ConfirmActionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    confirmLabel: string
    onConfirm: () => Promise<void>
    variant?: ConfirmVariant
}

export function ConfirmActionDialog({
                                        open,
                                        onOpenChange,
                                        title,
                                        description,
                                        confirmLabel,
                                        onConfirm,
                                        variant = 'destructive',
                                    }: ConfirmActionDialogProps) {
    const t = useTranslations('admin.actions')
    const [pending, setPending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleConfirm = async () => {
        setPending(true)
        setError(null)
        try {
            await onConfirm()
            onOpenChange(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : t('unknownError'))
        } finally {
            setPending(false)
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (pending) return
                if (!next) setError(null)
                onOpenChange(next)
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {error && (
                    <p className="text-sm text-destructive" role="alert">
                        {error}
                    </p>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
                        {t('cancel')}
                    </Button>
                    <Button variant={variant} onClick={handleConfirm} disabled={pending}>
                        {pending ? t('working') : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}