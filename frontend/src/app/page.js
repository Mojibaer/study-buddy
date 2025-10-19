'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchResults } from '@/components/search/SearchResults'
import { SearchFeatures } from '@/components/search/SearchFeatures'
import { useSearch } from '@/hooks/useSearch'

export default function Home() {
  const { query, setQuery, results, loading, error, handleSearch } = useSearch()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Schnell die richtigen Unterlagen finden</h2>
            <p className="text-muted-foreground text-lg">
              Finde schnell die richtigen Inhalte - beschreib einfach was du lernen willst
            </p>
          </div>

          {/* Search Bar */}
          <SearchBar
            query={query}
            setQuery={setQuery}
            onSearch={handleSearch}
            loading={loading}
          />

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          {/* Search Results */}
          <SearchResults results={results} />

          {/* Features (only show when no search) */}
          {!results && !loading && <SearchFeatures />}
        </div>
      </main>

      <Footer />
    </div>
  )
}