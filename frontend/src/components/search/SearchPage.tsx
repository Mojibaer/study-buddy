'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { FolderOpen } from 'lucide-react'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchResults } from '@/components/search/SearchResults'
import { UploadDialog } from '@/components/upload/UploadDialog'
import { useSearch } from '@/hooks/useSearch'

const pillClass =
  'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border bg-card text-sm text-foreground hover:bg-accent transition-colors'

interface SearchPageProps {
  featuresSlot: React.ReactNode
}

export function SearchPage({ featuresSlot }: SearchPageProps) {
  const { query, setQuery, results, loading, error, filters, setFilters, handleSearch } = useSearch()
  const t = useTranslations()

  return (
    <main className="flex-1 container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">{t('search.heading')}</h2>
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

        {!results && !loading && (
          <div className="space-y-20">
            <div className="flex items-center justify-center gap-3">
              <Link href="/browse" className={pillClass}>
                <FolderOpen className="w-3.5 h-3.5" />
                {t('actions.exploreFiles')}
              </Link>
              <UploadDialog />
            </div>

            {featuresSlot}
          </div>
        )}
      </div>
    </main>
  )
}
