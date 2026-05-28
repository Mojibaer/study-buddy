'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface SemesterOption {
    id: number
    name: string
}

export interface EntityFormValues {
    name: string
    semesterId?: number
}

interface EntityFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    confirmLabel: string
    initialName?: string
    initialSemesterId?: number
    semesterOptions?: SemesterOption[]
    semesterLabel?: string
    onSubmit: (values: EntityFormValues) => Promise<void>
}

export function EntityFormDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    initialName = '',
    initialSemesterId,
    semesterOptions,
    semesterLabel,
    onSubmit,
}: EntityFormDialogProps) {
    const t = useTranslations('admin.structure.form')
    const [name, setName] = useState(initialName)
    const [semesterId, setSemesterId] = useState<number | undefined>(initialSemesterId)
    const [pending, setPending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            setName(initialName)
            setSemesterId(initialSemesterId)
            setError(null)
        }
    }, [open, initialName, initialSemesterId])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        const trimmed = name.trim()
        if (!trimmed) {
            setError(t('errors.nameRequired'))
            return
        }
        if (semesterOptions && semesterId === undefined) {
            setError(t('errors.semesterRequired'))
            return
        }
        setPending(true)
        setError(null)
        try {
            await onSubmit({ name: trimmed, semesterId })
            onOpenChange(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : t('errors.unknown'))
        } finally {
            setPending(false)
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (pending) return
                onOpenChange(next)
            }}
        >
            <DialogContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description && <DialogDescription>{description}</DialogDescription>}
                    </DialogHeader>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="entity-name">{t('name')}</Label>
                        <Input
                            id="entity-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            maxLength={255}
                        />
                    </div>

                    {semesterOptions && (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="entity-semester">{semesterLabel ?? t('semester')}</Label>
                            <Select
                                value={semesterId !== undefined ? String(semesterId) : ''}
                                onValueChange={(value) => setSemesterId(Number(value))}
                            >
                                <SelectTrigger id="entity-semester">
                                    <SelectValue placeholder={t('selectSemester')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {semesterOptions.map((option) => (
                                        <SelectItem key={option.id} value={String(option.id)}>
                                            {option.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {error && (
                        <p className="text-sm text-destructive" role="alert">
                            {error}
                        </p>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={pending}
                        >
                            {t('cancel')}
                        </Button>
                        <Button type="submit" disabled={pending}>
                            {pending ? t('saving') : confirmLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}