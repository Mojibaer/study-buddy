'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { api } from '@/api/client'
import { useFilters } from '@/hooks/useFilters'
import { Breadcrumbs } from '@/components/browse/Breadcrumbs'
import { FolderList } from '@/components/browse/FolderList'
import { DocumentList } from '@/components/browse/DocumentList'
import type { Document, BreadcrumbItem, FolderItem } from '@/types'

export default function BrowseContent() {
  const searchParams = useSearchParams()

  const semesterId = searchParams.get('semester')
  const subjectId = searchParams.get('subject')
  const categoryId = searchParams.get('category')

  const { filters, loading: filtersLoading, getSubjectsForSemester } = useFilters()
  const [allDocuments, setAllDocuments] = useState<Document[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [docsLoading, setDocsLoading] = useState(true)

  useEffect(() => {
    api.getDocuments()
      .then(setAllDocuments)
      .catch((err: Error) => console.error('Fehler beim Laden:', err))
      .finally(() => setDocsLoading(false))
  }, [])

  useEffect(() => {
    if (semesterId && subjectId && categoryId) {
      setDocuments(
        allDocuments.filter(
          (doc) =>
            doc.subject_id === parseInt(subjectId) &&
            doc.category_id === parseInt(categoryId)
        )
      )
    }
  }, [semesterId, subjectId, categoryId, allDocuments])

  const getSemester = (id: string) => filters.semesters.find((s) => s.id === parseInt(id))
  const getSubject = (id: string) => filters.subjects.find((s) => s.id === parseInt(id))
  const getCategory = (id: string) => filters.categories.find((c) => c.id === parseInt(id))

  const getCountForSemester = (semId: string) => {
    const subjectIds = getSubjectsForSemester(semId).map((s) => s.id)
    return allDocuments.filter((doc) => doc.subject_id != null && subjectIds.includes(doc.subject_id)).length
  }

  const getCountForSubject = (subjId: string) =>
    allDocuments.filter((doc) => doc.subject_id === parseInt(subjId)).length

  const getCountForCategory = (subjId: string, catId: string) =>
    allDocuments.filter(
      (doc) => doc.subject_id === parseInt(subjId) && doc.category_id === parseInt(catId)
    ).length

  const buildUrl = (params: { semester?: string | number; subject?: string | number; category?: string | number }) => {
    const url = new URLSearchParams()
    if (params.semester) url.set('semester', String(params.semester))
    if (params.subject) url.set('subject', String(params.subject))
    if (params.category) url.set('category', String(params.category))
    return `/browse?${url.toString()}`
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Software Design & Cloud Computing', href: '/browse' },
  ]
  if (semesterId) breadcrumbs.push({ label: getSemester(semesterId)?.name || semesterId, href: buildUrl({ semester: semesterId }) })
  if (subjectId) breadcrumbs.push({ label: getSubject(subjectId)?.name || subjectId, href: buildUrl({ semester: semesterId ?? undefined, subject: subjectId }) })
  if (categoryId) breadcrumbs.push({ label: getCategory(categoryId)?.name || categoryId, href: buildUrl({ semester: semesterId ?? undefined, subject: subjectId ?? undefined, category: categoryId }) })

  const loading = filtersLoading || docsLoading

  const renderContent = () => {
    if (loading) {
      return <div className="border rounded-lg p-8 text-center text-muted-foreground">Lade...</div>
    }

    if (semesterId && subjectId && categoryId) {
      return <DocumentList documents={documents} currentPath={searchParams.toString()} />
    }

    if (semesterId && subjectId) {
      return (
        <FolderList
          items={filters.categories.map((cat): FolderItem => ({
            key: cat.id,
            label: cat.name,
            href: buildUrl({ semester: semesterId, subject: subjectId, category: cat.id }),
            count: getCountForCategory(subjectId, String(cat.id)),
          }))}
        />
      )
    }

    if (semesterId) {
      return (
        <FolderList
          items={getSubjectsForSemester(semesterId).map((subj): FolderItem => ({
            key: subj.id,
            label: subj.name,
            href: buildUrl({ semester: semesterId, subject: subj.id }),
            count: getCountForSubject(String(subj.id)),
          }))}
        />
      )
    }

    return (
      <FolderList
        items={filters.semesters.map((sem): FolderItem => ({
          key: sem.id,
          label: sem.name,
          href: buildUrl({ semester: sem.id }),
          count: getCountForSemester(String(sem.id)),
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
