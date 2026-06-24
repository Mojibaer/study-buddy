'use client'

import { useTranslations } from 'next-intl'
import { Loader2, ArrowUp } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group'

interface SearchBarProps {
  query: string
  setQuery: (query: string) => void
  onSearch: () => void
  loading: boolean
}

export function SearchBar({ query, setQuery, onSearch, loading }: SearchBarProps) {
  const t = useTranslations()

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (query.trim()) onSearch()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <InputGroup className="[--radius:1rem]">
      <InputGroupTextarea
        placeholder={t('search.placeholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        className="min-h-[80px] resize-none"
      />
      <InputGroupAddon align="block-end">
        <InputGroupButton
          type="button"
          variant="default"
          className="rounded-full ml-auto"
          size="icon-sm"
          disabled={loading || !query.trim()}
          onClick={() => handleSubmit()}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          <span className="sr-only">{t('search.heading')}</span>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
