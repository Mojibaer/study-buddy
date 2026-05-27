'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useAdminDocument } from '@/hooks/admin/useAdminDocument'
import { useFilters } from '@/hooks/useFilters'

interface DocumentEditFormProps {
    id: number
}

function parseTags(input: string): string[] {
    return input
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
}

export function DocumentEditForm({ id }: DocumentEditFormProps) {
    const t = useTranslations('admin.documents')
    const tEdit = useTranslations('admin.documents.edit')
    const router = useRouter()
    const { document, loading, error, update } = useAdminDocument(id)
    const { filters, getSubjectsForSemester } = useFilters()

    const [semesterId, setSemesterId] = useState<number | null>(null)
    const [subjectId, setSubjectId] = useState<number | null>(null)
    const [categoryId, setCategoryId] = useState<number | null>(null)
    const [tagsInput, setTagsInput] = useState<string>('')
    const [hydrated, setHydrated] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    if (document && !hydrated) {
        setSemesterId(document.subject.semester?.id ?? null)
        setSubjectId(document.subject_id)
        setCategoryId(document.category_id)
        setTagsInput(document.tags.join(', '))
        setHydrated(true)
    }

    const availableSubjects = useMemo(
        () => getSubjectsForSemester(semesterId !== null ? String(semesterId) : null),
        [semesterId, getSubjectsForSemester],
    )

    if (loading) {
        return <p className="text-muted-foreground">{t('states.loading')}</p>
    }

    if (error || !document) {
        return (
            <Alert variant="destructive">
                <AlertTitle>{tEdit('notFoundTitle')}</AlertTitle>
                <AlertDescription>{error ?? tEdit('notFoundDescription')}</AlertDescription>
            </Alert>
        )
    }

    const handleSemesterChange = (value: string) => {
        const next = Number(value)
        setSemesterId(next)
        const subjects = getSubjectsForSemester(String(next))
        if (!subjects.some((s) => s.id === subjectId)) {
            setSubjectId(null)
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (subjectId === null || categoryId === null) {
            setFormError(tEdit('errors.missingFields'))
            return
        }
        setSaving(true)
        setFormError(null)
        try {
            await update({
                subject_id: subjectId,
                category_id: categoryId,
                tags: parseTags(tagsInput),
            })
            router.push(`/admin/documents/${id}`)
        } catch (err) {
            setFormError(err instanceof Error ? err.message : tEdit('errors.unknown'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <Button asChild variant="ghost" size="sm" className="w-fit">
                <Link href={`/admin/documents/${id}`}>
                    <ArrowLeft className="size-4" />
                    {tEdit('backToDetail')}
                </Link>
            </Button>

            <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold tracking-tight">{tEdit('title')}</h2>
                <p className="text-sm text-muted-foreground">{document.original_filename}</p>
            </div>

            {formError && (
                <Alert variant="destructive">
                    <AlertTitle>{tEdit('errors.title')}</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="semester">{tEdit('semester')}</Label>
                    <Select
                        value={semesterId !== null ? String(semesterId) : ''}
                        onValueChange={handleSemesterChange}
                    >
                        <SelectTrigger id="semester">
                            <SelectValue placeholder={tEdit('selectSemester')} />
                        </SelectTrigger>
                        <SelectContent>
                            {filters.semesters.map((semester) => (
                                <SelectItem key={semester.id} value={String(semester.id)}>
                                    {semester.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="subject">{tEdit('subject')}</Label>
                    <Select
                        value={subjectId !== null ? String(subjectId) : ''}
                        onValueChange={(value) => setSubjectId(Number(value))}
                        disabled={availableSubjects.length === 0}
                    >
                        <SelectTrigger id="subject">
                            <SelectValue
                                placeholder={
                                    availableSubjects.length === 0 ? tEdit('selectSemesterFirst') : tEdit('selectSubject')
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {availableSubjects.map((subject) => (
                                <SelectItem key={subject.id} value={String(subject.id)}>
                                    {subject.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="category">{tEdit('category')}</Label>
                    <Select
                        value={categoryId !== null ? String(categoryId) : ''}
                        onValueChange={(value) => setCategoryId(Number(value))}
                    >
                        <SelectTrigger id="category">
                            <SelectValue placeholder={tEdit('selectCategory')} />
                        </SelectTrigger>
                        <SelectContent>
                            {filters.categories.map((category) => (
                                <SelectItem key={category.id} value={String(category.id)}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="tags">{tEdit('tags')}</Label>
                    <Input
                        id="tags"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder={tEdit('tagsPlaceholder')}
                    />
                    <span className="text-xs text-muted-foreground">{tEdit('tagsHint')}</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button type="submit" disabled={saving}>
                    <Save className="size-4" />
                    {saving ? tEdit('saving') : tEdit('save')}
                </Button>
                <Button asChild type="button" variant="outline" disabled={saving}>
                    <Link href={`/admin/documents/${id}`}>{tEdit('cancel')}</Link>
                </Button>
            </div>
        </form>
    )
}