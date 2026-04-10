'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { FileText, Calendar, Tag, ExternalLink } from 'lucide-react'
import { RESULTS_PER_PAGE } from '@/lib/constants'
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
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">
        {t('search.results', { count: results.total_results, query: results.query })}
      </h3>

      {results.results.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('search.noResults')}</p>
            <p className="text-sm mt-2">{t('search.noResultsHint')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {paginatedResults.map((result) => (
              <ResultCard key={result.document.id} result={result} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {document.original_filename || document.filename}
        </CardTitle>
        <CardDescription>
          {t('search.matchScore')}: {((1 - result.distance) * 100).toFixed(1)}%
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {document.category?.name && (
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>{document.category.name}</span>
            </div>
          )}
          {document.subject?.name && (
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>{document.subject.name}</span>
            </div>
          )}
          {document.subject?.semester?.name && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{document.subject.semester.name}</span>
            </div>
          )}
        </div>

        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {document.tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}

        <Link href={`/documents/${document.id}`}>
          <Button variant="outline" className="w-full mt-2">
            {t('search.showDetails')}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
