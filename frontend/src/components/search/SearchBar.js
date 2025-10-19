import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function SearchBar({ query, setQuery, onSearch, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder="z.B. 'Sortieralgorithmen', 'Python Funktionen', 'Lineare Algebra'..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12 text-lg"
          disabled={loading}
        />
      </div>
      <Button type="submit" disabled={loading} size="lg">
        {loading ? 'Suche...' : 'Suchen'}
      </Button>
    </form>
  )
}