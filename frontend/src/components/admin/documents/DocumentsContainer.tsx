'use client'

import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DocumentsToolbar } from '@/components/admin/documents/DocumentsToolbar'
import { DocumentsBulkBar } from '@/components/admin/documents/DocumentsBulkBar'
import { DocumentsTable } from '@/components/admin/documents/DocumentsTable'
import { useAdminDocuments } from '@/hooks/admin/useAdminDocuments'

export function DocumentsContainer() {
    const t = useTranslations('admin.documents')
    const {
        documents,
        loading,
        error,
        filter,
        setFilter,
        refresh,
        selectedIds,
        toggleSelected,
        toggleAll,
        clearSelection,
        bulkDelete,
    } = useAdminDocuments()

    const handleBulkDelete = async () => {
        await bulkDelete([...selectedIds])
    }

    return (
        <div className="flex flex-col gap-6">
            <DocumentsToolbar filter={filter} onFilterChange={setFilter} />

            <DocumentsBulkBar
                selectedCount={selectedIds.size}
                onClear={clearSelection}
                onConfirmDelete={handleBulkDelete}
            />

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>{t('errors.loadTitle')}</AlertTitle>
                    <AlertDescription className="flex items-center gap-3">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => void refresh()}
                            className="underline underline-offset-4 hover:no-underline"
                        >
                            {t('errors.retry')}
                        </button>
                    </AlertDescription>
                </Alert>
            )}

            {loading ? (
                <p className="text-muted-foreground">{t('states.loading')}</p>
            ) : documents.length === 0 ? (
                <p className="text-muted-foreground">{t('states.empty')}</p>
            ) : (
                <DocumentsTable
                    documents={documents}
                    selectedIds={selectedIds}
                    onToggleSelected={toggleSelected}
                    onToggleAll={toggleAll}
                />
            )}
        </div>
    )
}