'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  FileText,
  FolderOpen,
  BookOpen,
  Calendar,
  Bookmark,
  Eye,
  ChevronRight,
} from 'lucide-react'
import { RESULTS_PER_PAGE } from '@/lib/constants'
import { cn, calculateMatchScore, matchScoreBadgeClass, fileTypeIconClass } from '@/lib/utils'
import { useBookmarks } from '@/providers/BookmarksProvider'
import { FilePreview } from '@/components/document/FilePreview'
import type { SearchResponse, SearchResult } from '@/types'

interface SearchResultsProps {
  results: SearchResponse | null
}

export function SearchResults({ results }: SearchResultsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const t = useTranslations()

  useEffect(() => {
    setCurrentPage(1)
  }, [results?.query])

  if (!results) return null

  const totalPages = Math.ceil(results.results.length / RESULTS_PER_PAGE)
  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE
  const paginatedResults = results.results.slice(startIndex, startIndex + RESULTS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">
          {t('search.results', { count: results.total_results, query: results.query })}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('search.resultsFor', { query: results.query })}
        </p>
      </div>

      {results.results.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t('search.noResults')}</p>
          <p className="text-sm mt-2">{t('search.noResultsHint')}</p>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedResults.map((result) => (
              <ResultCard key={result.document.id} result={result} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  )
}

function ResultCard({ result }: { result: SearchResult }) {
  const t = useTranslations()
  const { document } = result
  const { isBookmarked, toggle } = useBookmarks()
  const [previewing, setPreviewing] = useState(false)

  const title = document.original_filename || document.filename
  const score = calculateMatchScore(result.score)
  const bookmarked = isBookmarked(document.id)

  return (
    <Card className="group p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        {/* File-type icon tile */}
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
            fileTypeIconClass(document.file_type, document.filename),
          )}
        >
          <FileText className="h-5 w-5" />
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/documents/${document.id}`}
              className="truncate font-semibold hover:underline"
              title={title}
            >
              {title}
            </Link>
            <span
              className={cn(
                'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                matchScoreBadgeClass(result.score),
              )}
            >
              {score}% {t('search.match')}
            </span>
          </div>

          {/* Meta row — one line on desktop, wraps only when it truly doesn't fit (mobile) */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {document.category?.name && (
              <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
                <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                {document.category.name}
              </span>
            )}
            {document.subject?.name && (
              <span className="flex min-w-0 items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{document.subject.name}</span>
              </span>
            )}
            {document.subject?.semester?.name && (
              <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                {document.subject.semester.name}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => toggle(document)}
            aria-pressed={bookmarked}
            title={t(bookmarked ? 'search.bookmarked' : 'search.bookmark')}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-primary text-primary')} />
          </button>
          <button
            type="button"
            onClick={() => setPreviewing(true)}
            disabled={!document.file_url}
            title={t('search.preview')}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
          >
            <Eye className="h-4 w-4" />
          </button>
          <Link
            href={`/documents/${document.id}`}
            title={t('search.viewDocument')}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {previewing && (
        <FilePreview
          document={document}
          defaultFullscreen
          onExitFullscreen={() => setPreviewing(false)}
        />
      )}
    </Card>
  )
}
