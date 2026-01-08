'use client'

import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X, Loader2, ArrowUp } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api'

export function SearchBar({ query, setQuery, onSearch, loading, filters: activeFilters, setFilters }) {
  const [filtersData, setFiltersData] = useState({ semesters: [], subjects: [], categories: [] })
  const [filtersLoading, setFiltersLoading] = useState(true)
  const [popoverOpen, setPopoverOpen] = useState(false)

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const data = await api.getFilters()
        setFiltersData(data)
      } catch (err) {
        console.error('Fehler beim Laden der Filter:', err)
      } finally {
        setFiltersLoading(false)
      }
    }
    loadFilters()
  }, [])

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (query.trim()) {
      onSearch()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSemesterChange = (value) => {
    setFilters(prev => ({
      ...prev,
      semester_id: value === 'all' ? null : value,
      subject_id: null
    }))
  }

  const handleSubjectChange = (value) => {
    setFilters(prev => ({
      ...prev,
      subject_id: value === 'all' ? null : value
    }))
  }

  const handleCategoryChange = (value) => {
    setFilters(prev => ({
      ...prev,
      category_id: value === 'all' ? null : value
    }))
  }

  const clearFilters = () => {
    setFilters({
      semester_id: null,
      subject_id: null,
      category_id: null
    })
  }

  const filteredSubjects = activeFilters.semester_id
    ? filtersData.subjects.filter(s => s.semester_id === parseInt(activeFilters.semester_id))
    : filtersData.subjects

  const getSemesterName = (id) => filtersData.semesters.find(s => s.id === parseInt(id))?.name
  const getSubjectName = (id) => filtersData.subjects.find(s => s.id === parseInt(id))?.name
  const getCategoryName = (id) => filtersData.categories.find(c => c.id === parseInt(id))?.name

  const hasActiveFilters = activeFilters.semester_id || activeFilters.subject_id || activeFilters.category_id
  const activeFilterCount = [activeFilters.semester_id, activeFilters.subject_id, activeFilters.category_id].filter(Boolean).length

  return (
    <div className="w-full space-y-2">
      <InputGroup className="[--radius:1rem]">
        <InputGroupTextarea
          placeholder="z.B. 'Sortieralgorithmen', 'Python Funktionen', 'Lineare Algebra'..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="min-h-[80px] resize-none"
        />
        <InputGroupAddon align="block-end">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <InputGroupButton
                type="button"
                variant="outline"
                className="rounded-full gap-1"
                size="sm"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent align="start" side="top" className="w-80 duration-100">
              <div className="space-y-4">
                <div className="font-medium">Filter</div>

                {filtersLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Semester</Label>
                      <Select
                        value={activeFilters.semester_id || 'all'}
                        onValueChange={handleSemesterChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Alle Semester" />
                        </SelectTrigger>
                        <SelectContent className="duration-100">
                          <SelectItem value="all">Alle Semester</SelectItem>
                          {filtersData.semesters.map((sem) => (
                            <SelectItem key={sem.id} value={String(sem.id)}>
                              {sem.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Fach</Label>
                      <Select
                        value={activeFilters.subject_id || 'all'}
                        onValueChange={handleSubjectChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Alle Fächer" />
                        </SelectTrigger>
                        <SelectContent className="duration-100">
                          <SelectItem value="all">Alle Fächer</SelectItem>
                          {filteredSubjects.map((subj) => (
                            <SelectItem key={subj.id} value={String(subj.id)}>
                              {subj.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Kategorie</Label>
                      <Select
                        value={activeFilters.category_id || 'all'}
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Alle Kategorien" />
                        </SelectTrigger>
                        <SelectContent className="duration-100">
                          <SelectItem value="all">Alle Kategorien</SelectItem>
                          {filtersData.categories.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {hasActiveFilters && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="w-full"
                      >
                        Filter zurücksetzen
                      </Button>
                    )}
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {hasActiveFilters && (
            <div className="hidden sm:flex items-center gap-1">
              {activeFilters.semester_id && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  {getSemesterName(activeFilters.semester_id)}
                  <button
                    type="button"
                    onClick={() => handleSemesterChange('all')}
                    className="hover:bg-muted rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {activeFilters.subject_id && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  {getSubjectName(activeFilters.subject_id)}
                  <button
                    type="button"
                    onClick={() => handleSubjectChange('all')}
                    className="hover:bg-muted rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {activeFilters.category_id && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  {getCategoryName(activeFilters.category_id)}
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('all')}
                    className="hover:bg-muted rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          <InputGroupButton
            type="button"
            variant="default"
            className="rounded-full ml-auto"
            size="icon-sm"
            disabled={loading || !query.trim()}
            onClick={handleSubmit}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
            <span className="sr-only">Suchen</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {hasActiveFilters && (
        <div className="flex sm:hidden flex-wrap gap-2 px-1">
          {activeFilters.semester_id && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {getSemesterName(activeFilters.semester_id)}
              <button
                type="button"
                onClick={() => handleSemesterChange('all')}
                className="hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFilters.subject_id && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {getSubjectName(activeFilters.subject_id)}
              <button
                type="button"
                onClick={() => handleSubjectChange('all')}
                className="hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFilters.category_id && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {getCategoryName(activeFilters.category_id)}
              <button
                type="button"
                onClick={() => handleCategoryChange('all')}
                className="hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}