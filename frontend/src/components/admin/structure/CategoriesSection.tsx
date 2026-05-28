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
import type { CategoryWithCounts } from '@/lib/admin/structureClient'

interface CategoriesSectionProps {
    categories: CategoryWithCounts[]
    onCreate: (name: string) => Promise<void>
    onRename: (id: number, name: string) => Promise<void>
    onDelete: (id: number) => Promise<void>
}

type DialogState =
    | { kind: 'create' }
    | { kind: 'rename'; category: CategoryWithCounts }
    | { kind: 'delete'; category: CategoryWithCounts }
    | null

export function CategoriesSection({
    categories,
    onCreate,
    onRename,
    onDelete,
}: CategoriesSectionProps) {
    const t = useTranslations('admin.structure.categories')
    const tCommon = useTranslations('admin.structure.common')
    const [dialog, setDialog] = useState<DialogState>(null)

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
                            <TableHead>{t('table.documents')}</TableHead>
                            <TableHead className="w-12 text-right">
                                <span className="sr-only">{tCommon('actions')}</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-muted-foreground">
                                    {t('empty')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{category.document_count}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={tCommon('openMenu', { name: category.name })}
                                                >
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onSelect={() => setDialog({ kind: 'rename', category })}
                                                >
                                                    <Pencil className="size-4" />
                                                    {tCommon('rename')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onSelect={() => setDialog({ kind: 'delete', category })}
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
                    initialName={dialog.category.name}
                    onSubmit={async ({ name }) => onRename(dialog.category.id, name)}
                />
            )}

            {dialog?.kind === 'delete' && (
                <DeleteEntityDialog
                    open
                    onOpenChange={(open) => !open && setDialog(null)}
                    title={t('deleteDialog.title')}
                    description={t('deleteDialog.description', { name: dialog.category.name })}
                    confirmLabel={t('deleteDialog.confirm')}
                    warning={
                        dialog.category.document_count > 0
                            ? t('deleteDialog.blocked', { count: dialog.category.document_count })
                            : undefined
                    }
                    onConfirm={() => onDelete(dialog.category.id)}
                />
            )}
        </div>
    )
}