'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Calendar, Tag, Folder, BookOpen, HardDrive } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'
import type { Document } from '@/types'
import type { LucideIcon } from 'lucide-react'

interface DocumentMetadataProps {
  document: Document
}

export function DocumentMetadata({ document }: DocumentMetadataProps) {
  const t = useTranslations()

  const metadataItems: { icon: LucideIcon; label: string; value: string | undefined }[] = [
    { icon: FileText, label: t('document.filename'), value: document.original_filename || document.filename },
    { icon: Folder, label: t('document.category'), value: document.category?.name },
    { icon: BookOpen, label: t('document.subject'), value: document.subject?.name },
    { icon: Calendar, label: t('document.semester'), value: document.subject?.semester?.name },
    { icon: Calendar, label: t('document.uploaded'), value: document.created_at ? formatDate(document.created_at) : undefined },
    { icon: HardDrive, label: t('document.fileSize'), value: document.file_size ? formatFileSize(document.file_size) : undefined },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('document.details')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 break-all">
        <div className="grid gap-3">
          {metadataItems.map((item) => {
            if (!item.value) return null
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-start gap-3">
                <Icon className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-muted-foreground">{item.label}</div>
                  <div className="text-sm break-words">{item.value}</div>
                </div>
              </div>
            )
          })}
        </div>

        {document.tags && document.tags.length > 0 && (
          <div className="flex items-start gap-3 pt-2">
            <Tag className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-muted-foreground mb-2">{t('document.tags')}</div>
              <div className="flex flex-wrap gap-1">
                {document.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
