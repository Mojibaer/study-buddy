'use client'

import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { EntityFormDialog } from '@/components/admin/structure/EntityFormDialog'
import { DeleteEntityDialog } from '@/components/admin/structure/DeleteEntityDialog'
import { ApiError, type SemesterWithCounts } from '@/lib/admin/structureClient'

interface SemestersSectionProps {
    semesters: SemesterWithCounts[]
    onCreate: (name: string) => Promise<void>
    onRename: (id: number, name: string) => Promise<void>
    onDelete: (id: number, force?: boolean) => Promise<void>
}

type DialogState =
    | { kind: 'create' }
    | { kind: 'rename'; semester: SemesterWithCounts }
    | { kind: 'delete'; semester: SemesterWithCounts; force: boolean }
    | null

export function SemestersSection({
    semesters,
    onCreate,
    onRename,
    onDelete,
}: SemestersSectionProps) {
    const t = useTranslations('admin.structure.semesters')
    const tCommon = useTranslations('admin.structure.common')
    const [dialog, setDialog] = useState<DialogState>(null)

    const handleDelete = async (semester: SemesterWithCounts) => {
        try {
            await onDelete(semester.id, false)
        } catch (err) {
            if (err instanceof ApiError && err.detail?.reason === 'has_subjects') {
                setDialog({ kind: 'delete', semester, force: true })
                return
            }
            throw err
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{t('description')}</p>
                <Button size="sm" onClick={() => setDialog({ kind: 'create' })}>
                    <Plus className="size-4" />
                    {t('create')}
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.name')}</TableHead>
                            <TableHead>{t('table.subjects')}</TableHead>
                            <TableHead>{t('table.documents')}</TableHead>
                            <TableHead className="w-12 text-right">
                                <span className="sr-only">{tCommon('actions')}</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {semesters.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-muted-foreground">
                                    {t('empty')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            semesters.map((semester) => (
                                <TableRow key={semester.id}>
                                    <TableCell className="font-medium">{semester.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{semester.subject_count}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{semester.document_count}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={tCommon('openMenu', { name: semester.name })}
                                                >
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onSelect={() => setDialog({ kind: 'rename', semester })}
                                                >
                                                    <Pencil className="size-4" />
                                                    {tCommon('rename')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onSelect={() =>
                                                        setDialog({ kind: 'delete', semester, force: false })
                                                    }
                                                >
                                                    <Trash2 className="size-4" />
                                                    {tCommon('delete')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {dialog?.kind === 'create' && (
                <EntityFormDialog
                    open
                    onOpenChange={(open) => !open && setDialog(null)}
                    title={t('createDialog.title')}
                    description={t('createDialog.description')}
                    confirmLabel={t('createDialog.confirm')}
                    onSubmit={async ({ name }) => onCreate(name)}
                />
            )}

            {dialog?.kind === 'rename' && (
                <EntityFormDialog
                    open
                    onOpenChange={(open) => !open && setDialog(null)}
                    title={t('renameDialog.title')}
                    confirmLabel={t('renameDialog.confirm')}
                    initialName={dialog.semester.name}
                    onSubmit={async ({ name }) => onRename(dialog.semester.id, name)}
                />
            )}

            {dialog?.kind === 'delete' && (
                <DeleteEntityDialog
                    open
                    onOpenChange={(open) => !open && setDialog(null)}
                    title={t('deleteDialog.title')}
                    description={t('deleteDialog.description', { name: dialog.semester.name })}
                    confirmLabel={t('deleteDialog.confirm')}
                    warning={
                        dialog.force
                            ? t('deleteDialog.warning', {
                                subjects: dialog.semester.subject_count,
                                documents: dialog.semester.document_count,
                            })
                            : undefined
                    }
                    onConfirm={
                        dialog.force
                            ? () => onDelete(dialog.semester.id, true)
                            : () => handleDelete(dialog.semester)
                    }
                />
            )}
        </div>
    )
}