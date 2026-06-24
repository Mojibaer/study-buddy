'use client'

import { useTranslations } from 'next-intl'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFilters } from '@/hooks/useFilters'
import type { SearchFilters as SearchFiltersType } from '@/types'

interface SearchFiltersProps {
  filters: SearchFiltersType
  applyFilters: (next: SearchFiltersType) => void
}

const triggerClass = 'min-w-0 flex-1 [&_[data-slot=select-value]]:truncate'

export function SearchFilters({ filters, applyFilters }: SearchFiltersProps) {
  const { filters: filtersData, getSubjectsForSemester } = useFilters()
  const t = useTranslations()

  const onSemester = (value: string) =>
    applyFilters({ ...filters, semester_id: value === 'all' ? null : value, subject_id: null })
  const onSubject = (value: string) =>
    applyFilters({ ...filters, subject_id: value === 'all' ? null : value })
  const onCategory = (value: string) =>
    applyFilters({ ...filters, category_id: value === 'all' ? null : value })

  const subjects = getSubjectsForSemester(filters.semester_id)

  return (
    <div className="flex gap-2">
      <Select value={filters.semester_id || 'all'} onValueChange={onSemester}>
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder={t('search.allSemesters')} />
        </SelectTrigger>
        <SelectContent className="duration-100">
          <SelectItem value="all">{t('search.allSemesters')}</SelectItem>
          {filtersData.semesters.map((sem) => (
            <SelectItem key={sem.id} value={String(sem.id)}>{sem.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.subject_id || 'all'} onValueChange={onSubject}>
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder={t('search.allSubjects')} />
        </SelectTrigger>
        <SelectContent className="duration-100">
          <SelectItem value="all">{t('search.allSubjects')}</SelectItem>
          {subjects.map((subj) => (
            <SelectItem key={subj.id} value={String(subj.id)}>{subj.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.category_id || 'all'} onValueChange={onCategory}>
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder={t('search.allCategories')} />
        </SelectTrigger>
        <SelectContent className="duration-100">
          <SelectItem value="all">{t('search.allCategories')}</SelectItem>
          {filtersData.categories.map((cat) => (
            <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
