'use client'

import { useTranslations } from 'next-intl'
import { useBrowse } from '@/hooks/useBrowse'
import { Breadcrumbs } from '@/components/browse/Breadcrumbs'
import { FolderList } from '@/components/browse/FolderList'
import { DocumentList } from '@/components/browse/DocumentList'

export function BrowseShell() {
  const { loading, semesterId, subjectId, categoryId, breadcrumbs, documents, folderItems, currentPath } = useBrowse()
  const t = useTranslations()

  return (
    <>
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">{t('browse.loading')}</div>
        ) : semesterId && subjectId && categoryId ? (
          <DocumentList documents={documents} currentPath={currentPath} />
        ) : (
          <FolderList items={folderItems} />
        )}
      </div>
    </>
  )
}
