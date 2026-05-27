'use client'

import { Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { ConfirmActionDialog } from '@/components/admin/users/ConfirmActionDialog'

interface DocumentsBulkBarProps {
    selectedCount: number
    onClear: () => void
    onConfirmDelete: () => Promise<void>
}

export function DocumentsBulkBar({ selectedCount, onClear, onConfirmDelete }: DocumentsBulkBarProps) {
    const t = useTranslations('admin.documents.bulk')
    const [confirmOpen, setConfirmOpen] = useState(false)

    if (selectedCount === 0) return null

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/40 px-4 py-2">
                <span className="text-sm font-medium">
                    {t('selected', { count: selectedCount })}
                </span>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={onClear}>
                        <X className="size-4" />
                        {t('clear')}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
                        <Trash2 className="size-4" />
                        {t('delete')}
                    </Button>
                </div>
            </div>

            <ConfirmActionDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={t('confirm.title', { count: selectedCount })}
                description={t('confirm.description', { count: selectedCount })}
                confirmLabel={t('confirm.confirm')}
                onConfirm={onConfirmDelete}
            />
        </>
    )
}