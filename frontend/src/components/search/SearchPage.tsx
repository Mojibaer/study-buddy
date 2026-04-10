'use client'

import { useTranslations } from 'next-intl'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchResults } from '@/components/search/SearchResults'
import { SearchFeatures } from '@/components/search/SearchFeatures'
import { useSearch } from '@/hooks/useSearch'

export function SearchPage() {
  const { query, setQuery, results, loading, error, filters, setFilters, handleSearch } = useSearch()
  const t = useTranslations()

  return (
    <main className="flex-1 container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold">{t('search.heading')}</h2>
          <p className="text-muted-foreground text-lg">{t('search.subheading')}</p>
        </div>

        <SearchBar
          query={query}
          setQuery={setQuery}
          onSearch={handleSearch}
          loading={loading}
          filters={filters}
          setFilters={setFilters}
        />

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>
        )}

        <SearchResults results={results} />

        {!results && !loading && <SearchFeatures />}
      </div>
    </main>
  )
}
