'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { FolderOpen, Clock } from 'lucide-react'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchResults } from '@/components/search/SearchResults'
import { UploadDialog } from '@/components/upload/UploadDialog'
import { useSearch } from '@/hooks/useSearch'
import { useRecentSearches } from '@/hooks/useRecentSearches'

const pillClass =
  'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border bg-card text-sm text-foreground hover:bg-accent transition-colors'

// Primary-bordered variant for the main actions (Explore files / Upload).
const actionPillClass =
  'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-primary bg-card text-sm text-foreground hover:bg-primary/10 transition-colors'

export function SearchPage() {
  const { query, setQuery, results, loading, error, filters, setFilters, handleSearch } = useSearch()
  const { recent, add: addRecent } = useRecentSearches()
  const t = useTranslations()

  const idle = !results && !loading

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
    <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-12 -mt-16">
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
                    <button
                      key={term}
                      type="button"
                      onClick={() => runRecentSearch(term)}
                      title={term}
                      className={`${pillClass} shrink-0 max-w-[12rem]`}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{term}</span>
                    </button>
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
