'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Bookmark, FileText, X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeaderBar,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useBookmarks } from '@/providers/BookmarksProvider'
import { cn, fileTypeIconClass } from '@/lib/utils'

export function SavedSidebar({ trigger }: { trigger?: React.ReactNode }) {
  const { documents, count, toggle } = useBookmarks()
  const [open, setOpen] = useState(false)
  const t = useTranslations()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            aria-label={t('bookmarks.title')}
            className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Bookmark className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {count}
              </span>
            )}
          </button>
        )}
      </SheetTrigger>

      <SheetContent showCloseButton={false} className="flex w-full flex-col gap-0 p-0 sm:max-w-sm">
        <SheetHeaderBar
          icon={<Bookmark className="h-5 w-5 text-primary" />}
          title={t('bookmarks.title')}
          closeLabel={t('actions.close')}
        />

        {documents.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-muted-foreground">
            <Bookmark className="mb-4 h-10 w-10 opacity-40" />
            <p className="font-medium text-foreground">{t('bookmarks.empty')}</p>
            <p className="mt-1 text-sm">{t('bookmarks.emptyHint')}</p>
          </div>
        ) : (
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {documents.map((doc) => {
              const title = doc.original_filename || doc.filename
              return (
                <div
                  key={doc.id}
                  className="group flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
                      fileTypeIconClass(doc.file_type, doc.filename),
                    )}
                  >
                    <FileText className="h-4 w-4" />
                  </div>
                  <Link
                    href={`/documents/${doc.id}`}
                    onClick={() => setOpen(false)}
                    className="min-w-0 flex-1"
                  >
                    <div className="truncate text-sm font-medium" title={title}>
                      {title}
                    </div>
                    {doc.subject?.name && (
                      <div className="truncate text-xs text-muted-foreground">
                        {doc.subject.name}
                      </div>
                    )}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggle(doc)}
                    aria-label={t('bookmarks.remove')}
                    title={t('bookmarks.remove')}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-foreground group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
