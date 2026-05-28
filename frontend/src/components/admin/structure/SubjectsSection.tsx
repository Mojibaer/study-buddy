'use client'

import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import type {
    SemesterWithCounts,
    SubjectWithCounts,
} from '@/lib/admin/structureClient'

interface SubjectsSectionProps {
    subjects: SubjectWithCounts[]
    semesters: SemesterWithCounts[]
    onCreate: (name: string, semesterId: number) => Promise<void>
    onUpdate: (
        id: number,
        body: { name?: string; semester_id?: number },
    ) => Promise<void>
    onDelete: (id: number) => Promise<void>
}

type DialogState =
    | { kind: 'create' }
    | { kind: 'edit'; subject: SubjectWithCounts }
    | { kind: 'delete'; subject: SubjectWithCounts }
    | null

export function SubjectsSection({
    subjects,
    semesters,
    onCreate,
    onUpdate,
    onDelete,
}: SubjectsSectionProps) {
    const t = useTranslations('admin.structure.subjects')
    const tCommon = useTranslations('admin.structure.common')
    const [dialog, setDialog] = useState<DialogState>(null)

    const semesterOptions = semesters.map((s) => ({ id: s.id, name: s.name }))
    const noSemesters = semesterOptions.length === 0

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">{t('description')}</p>
                <Button
                    size="sm"
                    disabled={noSemesters}
                    onClick={() => setDialog({ kind: 'create' })}
                >
                    <Plus className="size-4" />
                    {t('create')}
                </Button>
            </div>

            {noSemesters && (
                <Alert>
                    <AlertTitle>{t('noSemestersTitle')}</AlertTitle>
                    <AlertDescription>{t('noSemestersDescription')}</AlertDescription>
                </Alert>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.name')}</TableHead>
                            <TableHead>{t('table.semester')}</TableHead>
                            <TableHead>{t('table.documents')}</TableHead>
                            <TableHead className="w-12 text-right">
                                <span className="sr-only">{tCommon('actions')}</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subjects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-muted-foreground">
                                    {t('empty')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            subjects.map((subject) => (
                                <TableRow key={subject.id}>
                                    <TableCell className="font-medium">{subject.name}</TableCell>
                                    <TableCell>{subject.semester?.name ?? '—'}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{subject.document_count}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={tCommon('openMenu', { name: subject.name })}
                                                >
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => setDialog({ kind: 'edit', subject })}>
                                                    <Pencil className="size-4" />
                                                    {tCommon('edit')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onSelect={() => setDialog({ kind: 'delete', subject })}
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
                    semesterOptions={semesterOptions}
                    semesterLabel={t('form.semester')}
                    onSubmit={async ({ name, semesterId }) => {
                        if (semesterId === undefined) return
                        await onCreate(name, semesterId)
                    }}
                />
            )}

            {dialog?.kind === 'edit' && (
                <EntityFormDialog
                    open
                    onOpenChange={(open) => !open && setDialog(null)}
                    title={t('editDialog.title')}
                    confirmLabel={t('editDialog.confirm')}
                    initialName={dialog.subject.name}
                    initialSemesterId={dialog.subject.semester_id}
                    semesterOptions={semesterOptions}
                    semesterLabel={t('form.semester')}
                    onSubmit={async ({ name, semesterId }) =>
                        onUpdate(dialog.subject.id, { name, semester_id: semesterId })
                    }
                />
            )}

            {dialog?.kind === 'delete' && (
                <DeleteEntityDialog
                    open
                    onOpenChange={(open) => !open && setDialog(null)}
                    title={t('deleteDialog.title')}
                    description={t('deleteDialog.description', { name: dialog.subject.name })}
                    confirmLabel={t('deleteDialog.confirm')}
                    warning={
                        dialog.subject.document_count > 0
                            ? t('deleteDialog.blocked', { count: dialog.subject.document_count })
                            : undefined
                    }
                    onConfirm={() => onDelete(dialog.subject.id)}
                />
            )}
        </div>
    )
}