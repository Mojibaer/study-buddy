'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Clock, X, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { HOME_RESET_EVENT } from '@/lib/events'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchFilters } from '@/components/search/SearchFilters'
import { SearchResults } from '@/components/search/SearchResults'
import { useSearch } from '@/hooks/useSearch'
import { useRecentSearches } from '@/hooks/useRecentSearches'

const pillClass =
  'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border bg-card text-sm text-foreground hover:bg-accent transition-colors'

export function SearchPage() {
  const { query, setQuery, results, loading, error, filters, applyFilters, handleSearch, resetSearch } = useSearch()
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
        'flex-1 flex justify-center container mx-auto px-4',
        // Center + generous spacing when empty; top-align with tighter top padding once results show.
        idle ? 'items-center -mt-16 py-12' : 'items-start pt-6 pb-12',
      )}
    >
      <div className="w-full max-w-3xl mx-auto space-y-8">
        {idle ? (
          <>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-3">
                <Image src="/logo.svg" alt="StudyBuddy" width={48} height={44} priority />
                <span className="text-4xl font-bold tracking-tight">StudyBuddy</span>
              </div>
              <p className="text-muted-foreground text-lg">{t('search.subheading')}</p>
            </div>

            <SearchBar
              query={query}
              setQuery={setQuery}
              onSearch={() => search()}
              loading={loading}
            />

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>
            )}

            {recent.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {t('search.recentSearches')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((term) => (
                    <div
                      key={term}
                      className={`${pillClass} group max-w-full pr-2.5`}
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
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={resetSearch} className="-ml-2 hidden sm:inline-flex">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('search.backToSearch')}
            </Button>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>
            )}

            <SearchFilters filters={filters} applyFilters={applyFilters} />

            <SearchResults results={results} />
          </>
        )}
      </div>
    </main>
  )
}
