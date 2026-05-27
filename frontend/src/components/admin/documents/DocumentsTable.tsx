'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    IndexedBadge,
    OrphanedBadge,
} from '@/components/admin/documents/DocumentStatusBadges'
import type { AdminDocument } from '@/lib/admin/documentsClient'
import { formatFileSize } from '@/lib/utils'

interface DocumentsTableProps {
    documents: AdminDocument[]
    selectedIds: Set<number>
    onToggleSelected: (id: number) => void
    onToggleAll: () => void
}

export function DocumentsTable({
    documents,
    selectedIds,
    onToggleSelected,
    onToggleAll,
}: DocumentsTableProps) {
    const t = useTranslations('admin.documents.table')
    const format = useFormatter()

    const allSelected = documents.length > 0 && selectedIds.size === documents.length
    const someSelected = selectedIds.size > 0 && !allSelected

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10">
                            <Checkbox
                                checked={allSelected}
                                indeterminate={someSelected}
                                onChange={onToggleAll}
                                aria-label={t('selectAll')}
                            />
                        </TableHead>
                        <TableHead>{t('document')}</TableHead>
                        <TableHead>{t('subject')}</TableHead>
                        <TableHead>{t('category')}</TableHead>
                        <TableHead>{t('uploader')}</TableHead>
                        <TableHead>{t('index')}</TableHead>
                        <TableHead>{t('size')}</TableHead>
                        <TableHead>{t('uploaded')}</TableHead>
                        <TableHead className="w-12 text-right">
                            <span className="sr-only">{t('actions')}</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documents.map((document) => {
                        const orphaned = document.uploader === null
                        return (
                            <TableRow key={document.id} data-state={selectedIds.has(document.id) ? 'selected' : undefined}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedIds.has(document.id)}
                                        onChange={() => onToggleSelected(document.id)}
                                        aria-label={t('selectRow', { name: document.original_filename })}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-0.5">
                                        <Link
                                            href={`/admin/documents/${document.id}`}
                                            className="font-medium hover:underline"
                                        >
                                            {document.original_filename}
                                        </Link>
                                        <span className="text-xs text-muted-foreground">
                                            {document.file_type} · {t('idLabel', { id: document.id })}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{document.subject.name}</span>
                                        {document.subject.semester && (
                                            <span className="text-xs text-muted-foreground">
                                                {document.subject.semester.name}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{document.category.name}</TableCell>
                                <TableCell>
                                    {orphaned ? (
                                        <OrphanedBadge />
                                    ) : (
                                        <span className="text-sm">
                                            {document.uploader?.username ?? document.uploader?.email}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <IndexedBadge indexed={document.indexed_in_weaviate} />
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatFileSize(document.file_size)}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {format.dateTime(new Date(document.created_at), { dateStyle: 'medium' })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="ghost" size="icon" aria-label={t('open')}>
                                        <Link href={`/admin/documents/${document.id}`}>
                                            <ExternalLink className="size-4" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}