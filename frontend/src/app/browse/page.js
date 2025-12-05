'use client'

import { Header } from '@/components/layout/Header'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Folder,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  STUDIENGANG,
  SUBJECTS_BY_SEMESTER,
  CATEGORIES,
  getSubjectLabel,
  getCategoryLabel,
} from '@/lib/constants'

export default function BrowsePage() {
  const searchParams = useSearchParams()

  const semester = searchParams.get('semester')
  const subject = searchParams.get('subject')
  const category = searchParams.get('category')

  const [allDocuments, setAllDocuments] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    fetchAllDocuments()
  }, [])

  useEffect(() => {
    if (semester && subject && category) {
      filterDocuments()
    }
  }, [semester, subject, category, allDocuments])

  const fetchAllDocuments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents`)
      if (response.ok) {
        const data = await response.json()
        setAllDocuments(data)
      }
    } catch (err) {
      console.error('Fehler beim Laden:', err)
    } finally {
      setInitialLoading(false)
    }
  }

  const filterDocuments = () => {
    setLoading(true)
    const semesterData = SUBJECTS_BY_SEMESTER[semester]

    const filtered = allDocuments.filter((doc) => {
      const matchesSemester = doc.semester === semesterData?.semesterCode
      const matchesSubject = doc.subject === getSubjectLabel(semester, subject)
      const matchesCategory = doc.category === category
      return matchesSemester && matchesSubject && matchesCategory
    })

    setDocuments(filtered)
    setLoading(false)
  }

  const getCountForSemester = (semesterKey) => {
    const semesterData = SUBJECTS_BY_SEMESTER[semesterKey]
    return allDocuments.filter((doc) => doc.semester === semesterData?.semesterCode).length
  }

  const getCountForSubject = (semesterKey, subjectValue) => {
    const semesterData = SUBJECTS_BY_SEMESTER[semesterKey]
    const subjectLabel = getSubjectLabel(semesterKey, subjectValue)
    return allDocuments.filter((doc) =>
      doc.semester === semesterData?.semesterCode &&
      doc.subject === subjectLabel
    ).length
  }

  const getCountForCategory = (semesterKey, subjectValue, categoryValue) => {
    const semesterData = SUBJECTS_BY_SEMESTER[semesterKey]
    const subjectLabel = getSubjectLabel(semesterKey, subjectValue)
    return allDocuments.filter((doc) =>
      doc.semester === semesterData?.semesterCode &&
      doc.subject === subjectLabel &&
      doc.category === categoryValue
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
    { label: STUDIENGANG, href: '/browse' },
  ]

  if (semester) {
    breadcrumbs.push({
      label: SUBJECTS_BY_SEMESTER[semester]?.label || semester,
      href: buildUrl({ semester }),
    })
  }

  if (subject) {
    breadcrumbs.push({
      label: getSubjectLabel(semester, subject),
      href: buildUrl({ semester, subject }),
    })
  }

  if (category) {
    breadcrumbs.push({
      label: getCategoryLabel(category),
      href: buildUrl({ semester, subject, category }),
    })
  }

  const renderContent = () => {
    if (initialLoading) {
      return (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          Lade...
        </div>
      )
    }

    if (semester && subject && category) {
      return (
        <DocumentList
          documents={documents}
          loading={loading}
          currentPath={searchParams.toString()}
        />
      )
    }

    if (semester && subject) {
      return (
        <FolderList
          items={CATEGORIES.map((cat) => ({
            key: cat.value,
            label: cat.label,
            href: buildUrl({ semester, subject, category: cat.value }),
            count: getCountForCategory(semester, subject, cat.value),
          }))}
        />
      )
    }

    if (semester) {
      const semesterData = SUBJECTS_BY_SEMESTER[semester]
      if (!semesterData) return <p>Semester nicht gefunden</p>

      return (
        <FolderList
          items={semesterData.subjects.map((subj) => ({
            key: subj.value,
            label: subj.label,
            href: buildUrl({ semester, subject: subj.value }),
            count: getCountForSubject(semester, subj.value),
          }))}
        />
      )
    }

    return (
      <FolderList
        items={Object.entries(SUBJECTS_BY_SEMESTER).map(([key, data]) => ({
          key,
          label: data.label,
          href: buildUrl({ semester: key }),
          count: getCountForSemester(key),
        }))}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {renderContent()}
      </div>
    </div>
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

function DocumentList({ documents, loading, currentPath }) {
  if (loading) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        Lade Dokumente...
      </div>
    )
  }

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

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}