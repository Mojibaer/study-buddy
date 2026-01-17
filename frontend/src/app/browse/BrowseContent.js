'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Folder, FileText, ChevronRight } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'
import { api } from '@/lib/api'

export default function BrowseContent() {
    const searchParams = useSearchParams()

    const semesterId = searchParams.get('semester')
    const subjectId = searchParams.get('subject')
    const categoryId = searchParams.get('category')

    const [filters, setFilters] = useState({ semesters: [], subjects: [], categories: [] })
    const [documents, setDocuments] = useState([])
    const [allDocuments, setAllDocuments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [filtersData, documentsData] = await Promise.all([
                    api.getFilters(),
                    api.getDocuments()
                ])
                setFilters(filtersData)
                setAllDocuments(documentsData)
            } catch (err) {
                console.error('Fehler beim Laden:', err)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    useEffect(() => {
        if (semesterId && subjectId && categoryId) {
            const filtered = allDocuments.filter((doc) => {
                const matchesSubject = doc.subject_id === parseInt(subjectId)
                const matchesCategory = doc.category_id === parseInt(categoryId)
                return matchesSubject && matchesCategory
            })
            setDocuments(filtered)
        }
    }, [semesterId, subjectId, categoryId, allDocuments])

    const getSemester = (id) => filters.semesters.find(s => s.id === parseInt(id))
    const getSubject = (id) => filters.subjects.find(s => s.id === parseInt(id))
    const getCategory = (id) => filters.categories.find(c => c.id === parseInt(id))

    const getSubjectsForSemester = (semId) => {
        return filters.subjects.filter(s => s.semester_id === parseInt(semId))
    }

    const getCountForSemester = (semId) => {
        const subjectIds = getSubjectsForSemester(semId).map(s => s.id)
        return allDocuments.filter(doc => subjectIds.includes(doc.subject_id)).length
    }

    const getCountForSubject = (subjId) => {
        return allDocuments.filter(doc => doc.subject_id === parseInt(subjId)).length
    }

    const getCountForCategory = (subjId, catId) => {
        return allDocuments.filter(doc =>
            doc.subject_id === parseInt(subjId) &&
            doc.category_id === parseInt(catId)
        ).length
    }

    const buildUrl = (params) => {
        const url = new URLSearchParams()
        if (params.semester) url.set('semester', params.semester)
        if (params.subject) url.set('subject', params.subject)
        if (params.category) url.set('category', params.category)
        return `/browse?${url.toString()}`
    }

    const breadcrumbs = [
        { label: 'Software Design & Cloud Computing', href: '/browse' },
    ]

    if (semesterId) {
        breadcrumbs.push({
            label: getSemester(semesterId)?.name || semesterId,
            href: buildUrl({ semester: semesterId }),
        })
    }

    if (subjectId) {
        breadcrumbs.push({
            label: getSubject(subjectId)?.name || subjectId,
            href: buildUrl({ semester: semesterId, subject: subjectId }),
        })
    }

    if (categoryId) {
        breadcrumbs.push({
            label: getCategory(categoryId)?.name || categoryId,
            href: buildUrl({ semester: semesterId, subject: subjectId, category: categoryId }),
        })
    }

    const renderContent = () => {
        if (loading) {
            return (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    Lade...
                </div>
            )
        }

        if (semesterId && subjectId && categoryId) {
            return (
                <DocumentList
                    documents={documents}
                    currentPath={searchParams.toString()}
                />
            )
        }

        if (semesterId && subjectId) {
            return (
                <FolderList
                    items={filters.categories.map((cat) => ({
                        key: cat.id,
                        label: cat.name,
                        href: buildUrl({ semester: semesterId, subject: subjectId, category: cat.id }),
                        count: getCountForCategory(subjectId, cat.id),
                    }))}
                />
            )
        }

        if (semesterId) {
            return (
                <FolderList
                    items={getSubjectsForSemester(semesterId).map((subj) => ({
                        key: subj.id,
                        label: subj.name,
                        href: buildUrl({ semester: semesterId, subject: subj.id }),
                        count: getCountForSubject(subj.id),
                    }))}
                />
            )
        }

        return (
            <FolderList
                items={filters.semesters.map((sem) => ({
                    key: sem.id,
                    label: sem.name,
                    href: buildUrl({ semester: sem.id }),
                    count: getCountForSemester(sem.id),
                }))}
            />
        )
    }

    return (
        <>
            <div className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <Breadcrumbs items={breadcrumbs} />
                </div>
            </div>
            <div className="container mx-auto px-4 py-6">
                {renderContent()}
            </div>
        </>
    )
}

function Breadcrumbs({ items }) {
    return (
        <nav className="flex items-center gap-1 text-sm overflow-x-auto pb-2">
            {items.map((item, index) => (
                <div key={item.href} className="flex items-center gap-1 shrink-0">
                    {index > 0 && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    {index === items.length - 1 ? (
                        <span className="font-medium">{item.label}</span>
                    ) : (
                        <Link
                            href={item.href}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {item.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    )
}

function FolderList({ items }) {
    return (
        <div className="border rounded-lg divide-y">
            {items.map((item) => (
                <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3",
                        "hover:bg-accent transition-colors",
                        "min-h-[52px]"
                    )}
                >
                    <Folder className="w-5 h-5 text-yellow-500 shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.count !== undefined && (
                        <span className="text-sm text-muted-foreground">
                            ({item.count})
                        </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </Link>
            ))}
        </div>
    )
}

function DocumentList({ documents, currentPath }) {
    if (documents.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                Keine Dokumente in diesem Ordner
            </div>
        )
    }

    return (
        <div className="border rounded-lg divide-y">
            {documents.map((doc) => (
                <Link
                    key={doc.id}
                    href={`/documents/${doc.id}?from=/browse?${currentPath}`}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3",
                        "hover:bg-accent transition-colors",
                        "min-h-[52px]"
                    )}
                >
                    <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="truncate">{doc.original_filename || doc.filename}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatFileSize(doc.file_size)}
                        </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </Link>
            ))}
        </div>
    )
}