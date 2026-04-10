'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { FileText, ChevronRight } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'
import type { Document } from '@/types'

interface DocumentListProps {
  documents: Document[]
  currentPath: string
}

export function DocumentList({ documents, currentPath }: DocumentListProps) {
  const t = useTranslations()

  if (documents.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        {t('browse.noDocuments')}
      </div>
    )
  }

  return (
    <div className="border rounded-lg divide-y">
      {documents.map((doc) => (
        <Link
          key={doc.id}
          href={`/documents/${doc.id}?from=/browse?${currentPath}`}
          className={cn('flex items-center gap-3 px-4 py-3', 'hover:bg-accent transition-colors', 'min-h-[52px]')}
        >
          <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="truncate">{doc.original_filename || doc.filename}</p>
            <p className="text-xs text-muted-foreground">
              {doc.file_size != null ? formatFileSize(doc.file_size) : ''}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </Link>
      ))}
    </div>
  )
}
