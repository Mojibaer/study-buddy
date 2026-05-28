'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useFormatter, useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ConfirmActionDialog } from '@/components/admin/users/ConfirmActionDialog'
import {
    IndexedBadge,
    OrphanedBadge,
} from '@/components/admin/documents/DocumentStatusBadges'
import { useAdminDocument } from '@/hooks/admin/useAdminDocument'
import { formatFileSize } from '@/lib/utils'

interface DocumentDetailViewProps {
    id: number
}

export function DocumentDetailView({ id }: DocumentDetailViewProps) {
    const t = useTranslations('admin.documents')
    const tDetail = useTranslations('admin.documents.detail')
    const format = useFormatter()
    const router = useRouter()
    const { document, loading, error, remove } = useAdminDocument(id)
    const [deleteOpen, setDeleteOpen] = useState(false)

    const handleDelete = async () => {
        await remove()
        router.push('/admin/documents')
    }

    if (loading) {
        return <p className="text-muted-foreground">{t('states.loading')}</p>
    }

    if (error || !document) {
        return (
            <Alert variant="destructive">
                <AlertTitle>{tDetail('notFoundTitle')}</AlertTitle>
                <AlertDescription>{error ?? tDetail('notFoundDescription')}</AlertDescription>
            </Alert>
        )
    }

    const orphaned = document.uploader === null
    const uploaderLabel = document.uploader
        ? document.uploader.username ?? document.uploader.email
        : tDetail('unknownUploader')

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button asChild variant="ghost" size="sm" className="w-fit">
                    <Link href="/admin/documents">
                        <ArrowLeft className="size-4" />
                        {tDetail('backToList')}
                    </Link>
                </Button>
                <div className="flex flex-wrap items-center gap-2">
                    {document.file_url && (
                        <Button asChild variant="outline" size="sm">
                            <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                                <Download className="size-4" />
                                {tDetail('download')}
                            </a>
                        </Button>
                    )}
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/documents/${document.id}/edit`}>
                            <Pencil className="size-4" />
                            {tDetail('edit')}
                        </Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="size-4" />
                        {tDetail('delete')}
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold tracking-tight">{document.original_filename}</h2>
                <p className="text-sm text-muted-foreground">
                    {tDetail('idLabel', { id: document.id })} · {document.file_type}
                </p>
            </div>

            {orphaned && (
                <Alert variant="destructive">
                    <AlertTitle>{tDetail('orphanedTitle')}</AlertTitle>
                    <AlertDescription>{tDetail('orphanedDescription')}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{tDetail('classification')}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        <Field label={tDetail('subject')} value={document.subject.name} />
                        <Field
                            label={tDetail('semester')}
                            value={document.subject.semester?.name ?? tDetail('notSet')}
                        />
                        <Field label={tDetail('category')} value={document.category.name} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{tDetail('storage')}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        <Field label={tDetail('size')} value={formatFileSize(document.file_size)} />
                        <Field label={tDetail('storedFilename')} value={document.filename} mono />
                        <Field
                            label={tDetail('uploadedAt')}
                            value={format.dateTime(new Date(document.created_at), {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            })}
                        />
                        {document.updated_at && (
                            <Field
                                label={tDetail('updatedAt')}
                                value={format.dateTime(new Date(document.updated_at), {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                })}
                            />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{tDetail('uploader')}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">{uploaderLabel}</span>
                            {orphaned && <OrphanedBadge />}
                        </div>
                        {document.uploader && (
                            <>
                                <Field label={tDetail('uploaderEmail')} value={document.uploader.email} />
                                <Field label={tDetail('uploaderId')} value={String(document.uploaded_by)} />
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{tDetail('searchIndex')}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        <div className="flex items-center gap-2">
                            <IndexedBadge indexed={document.indexed_in_weaviate} />
                        </div>
                        <Separator />
                        <Field
                            label={tDetail('vectorizedAt')}
                            value={document.vectorized_at ?? tDetail('notIndexedDescription')}
                            mono={document.vectorized_at !== null}
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmActionDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title={tDetail('confirm.delete.title')}
                description={tDetail('confirm.delete.description', { name: document.original_filename })}
                confirmLabel={tDetail('confirm.delete.confirm')}
                onConfirm={handleDelete}
            />
        </div>
    )
}

interface FieldProps {
    label: string
    value: string
    mono?: boolean
}

function Field({ label, value, mono = false }: FieldProps) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase text-muted-foreground">{label}</span>
            <span className={mono ? 'font-mono text-sm break-all' : 'text-sm'}>{value}</span>
        </div>
    )
}