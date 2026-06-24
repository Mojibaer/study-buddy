'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { FolderOpen, Clock, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HOME_RESET_EVENT } from '@/lib/events'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchResults } from '@/components/search/SearchResults'
import { UploadDialog } from '@/components/upload/UploadDialog'
import { useSearch } from '@/hooks/useSearch'
import { useRecentSearches } from '@/hooks/useRecentSearches'

const pillClass =
  'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border bg-card text-sm text-foreground hover:bg-accent transition-colors'

// Primary-bordered variant for the main actions (Explore files / Upload).
const actionPillClass =
  'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-primary/40 bg-card text-sm text-foreground hover:border-primary/60 hover:bg-accent transition-colors'

export function SearchPage() {
  const { query, setQuery, results, loading, error, filters, setFilters, handleSearch, resetSearch } = useSearch()
  const { recent, add: addRecent, remove: removeRecent } = useRecentSearches()
  const t = useTranslations()

  const idle = !results && !loading

  // Clear the search when the header logo is clicked while already on home.
  useEffect(() => {
    window.addEventListener(HOME_RESET_EVENT, resetSearch)
    return () => window.removeEventListener(HOME_RESET_EVENT, resetSearch)
  }, [resetSearch])

  const search = (term?: string) => {
    const value = (term ?? query).trim()
    if (!value) return
    addRecent(value)
    handleSearch(value)
  }

  const runRecentSearch = (term: string) => {
    setQuery(term)
    search(term)
  }

  return (
    <main
      className={cn(
        'flex-1 flex justify-center container mx-auto px-4 py-12',
        // Center only when empty; top-align with results so the heading isn't hidden behind the header.
        idle ? 'items-center -mt-16' : 'items-start',
      )}
    >
      <div className="w-full max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-bold tracking-tight text-balance">{t('search.heading')}</h2>
          <p className="text-muted-foreground text-lg">{t('search.subheading')}</p>
        </div>

        <SearchBar
          query={query}
          setQuery={setQuery}
          onSearch={() => search()}
          loading={loading}
          filters={filters}
          setFilters={setFilters}
        />

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>
        )}

        <SearchResults results={results} />

        {idle && (
          <div className="space-y-12">
            {recent.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {t('search.recentSearches')}
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
                  {recent.map((term) => (
                    <div
                      key={term}
                      className={`${pillClass} group shrink-0 max-w-[14rem] pr-1.5`}
                    >
                      <button
                        type="button"
                        onClick={() => runRecentSearch(term)}
                        title={term}
                        className="flex min-w-0 items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{term}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRecent(term)}
                        aria-label={t('search.removeRecent')}
                        title={t('search.removeRecent')}
                        className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <Link href="/browse" className={actionPillClass}>
                <FolderOpen className="w-3.5 h-3.5" />
                {t('actions.exploreFiles')}
              </Link>
              <UploadDialog />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
