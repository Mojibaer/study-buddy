'use client'

import { Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useFilters } from '@/hooks/useFilters'
import type { AdminDocumentsFilter } from '@/lib/admin/documentsClient'

const ANY = '__any__'
const SEARCH_DEBOUNCE_MS = 250

interface DocumentsToolbarProps {
    filter: AdminDocumentsFilter
    onFilterChange: (next: AdminDocumentsFilter) => void
}

export function DocumentsToolbar({ filter, onFilterChange }: DocumentsToolbarProps) {
    const t = useTranslations('admin.documents.toolbar')
    const { filters, getSubjectsForSemester } = useFilters()
    const [searchInput, setSearchInput] = useState(filter.search ?? '')

    useEffect(() => {
        setSearchInput(filter.search ?? '')
    }, [filter.search])

    useEffect(() => {
        const trimmed = searchInput.trim()
        const current = filter.search ?? ''
        if (trimmed === current) return
        const handle = setTimeout(() => {
            onFilterChange({ ...filter, search: trimmed || undefined })
        }, SEARCH_DEBOUNCE_MS)
        return () => clearTimeout(handle)
    }, [searchInput, filter, onFilterChange])

    const subjects = useMemo(
        () => getSubjectsForSemester(filter.semester_id !== undefined ? String(filter.semester_id) : null),
        [filter.semester_id, getSubjectsForSemester],
    )

    const hasFilters =
        filter.search ||
        filter.semester_id !== undefined ||
        filter.subject_id !== undefined ||
        filter.category_id !== undefined ||
        filter.orphaned !== undefined ||
        filter.indexed !== undefined

    const setSemester = (value: string) => {
        if (value === ANY) {
            onFilterChange({ ...filter, semester_id: undefined, subject_id: undefined })
            return
        }
        onFilterChange({ ...filter, semester_id: Number(value), subject_id: undefined })
    }

    const setSubject = (value: string) =>
        onFilterChange({ ...filter, subject_id: value === ANY ? undefined : Number(value) })

    const setCategory = (value: string) =>
        onFilterChange({ ...filter, category_id: value === ANY ? undefined : Number(value) })

    const setOrphaned = (value: string) =>
        onFilterChange({ ...filter, orphaned: value === ANY ? undefined : value === 'true' })

    const setIndexed = (value: string) =>
        onFilterChange({ ...filter, indexed: value === ANY ? undefined : value === 'true' })

    const clear = () => {
        setSearchInput('')
        onFilterChange({})
    }

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative flex-1 min-w-[220px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    aria-label={t('searchPlaceholder')}
                    className="pl-9"
                />
            </div>

            <Select
                value={filter.semester_id !== undefined ? String(filter.semester_id) : ANY}
                onValueChange={setSemester}
            >
                <SelectTrigger className="w-[160px]" aria-label={t('semesterLabel')}>
                    <SelectValue placeholder={t('semesterLabel')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ANY}>{t('anySemester')}</SelectItem>
                    {filters.semesters.map((semester) => (
                        <SelectItem key={semester.id} value={String(semester.id)}>
                            {semester.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filter.subject_id !== undefined ? String(filter.subject_id) : ANY}
                onValueChange={setSubject}
                disabled={subjects.length === 0}
            >
                <SelectTrigger className="w-[180px]" aria-label={t('subjectLabel')}>
                    <SelectValue placeholder={t('subjectLabel')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ANY}>{t('anySubject')}</SelectItem>
                    {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={String(subject.id)}>
                            {subject.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filter.category_id !== undefined ? String(filter.category_id) : ANY}
                onValueChange={setCategory}
            >
                <SelectTrigger className="w-[160px]" aria-label={t('categoryLabel')}>
                    <SelectValue placeholder={t('categoryLabel')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ANY}>{t('anyCategory')}</SelectItem>
                    {filters.categories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                            {category.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filter.orphaned === undefined ? ANY : String(filter.orphaned)}
                onValueChange={setOrphaned}
            >
                <SelectTrigger className="w-[160px]" aria-label={t('uploaderLabel')}>
                    <SelectValue placeholder={t('uploaderLabel')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ANY}>{t('anyUploader')}</SelectItem>
                    <SelectItem value="false">{t('uploader.hasUploader')}</SelectItem>
                    <SelectItem value="true">{t('uploader.orphaned')}</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={filter.indexed === undefined ? ANY : String(filter.indexed)}
                onValueChange={setIndexed}
            >
                <SelectTrigger className="w-[160px]" aria-label={t('indexLabel')}>
                    <SelectValue placeholder={t('indexLabel')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ANY}>{t('anyIndexed')}</SelectItem>
                    <SelectItem value="true">{t('indexed.yes')}</SelectItem>
                    <SelectItem value="false">{t('indexed.no')}</SelectItem>
                </SelectContent>
            </Select>

            {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clear}>
                    <X className="size-4" />
                    {t('clear')}
                </Button>
            )}
        </div>
    )
}