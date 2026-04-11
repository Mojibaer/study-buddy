'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { api } from '@/api/client'
import { useFilters } from '@/hooks/useFilters'
import type { Document, BreadcrumbItem, FolderItem } from '@/types'

export function useBrowse() {
  const searchParams = useSearchParams()
  const t = useTranslations()
  const { filters, loading: filtersLoading, getSubjectsForSemester } = useFilters()
  const [allDocuments, setAllDocuments] = useState<Document[]>([])
  const [docsLoading, setDocsLoading] = useState(true)

  const semesterId = searchParams.get('semester')
  const subjectId = searchParams.get('subject')
  const categoryId = searchParams.get('category')

  useEffect(() => {
    api.getDocuments()
      .then(setAllDocuments)
      .catch((err: Error) => console.error('Error loading documents:', err))
      .finally(() => setDocsLoading(false))
  }, [])

  const getSemester = (id: string) => filters.semesters.find((s) => s.id === parseInt(id))
  const getSubject = (id: string) => filters.subjects.find((s) => s.id === parseInt(id))
  const getCategory = (id: string) => filters.categories.find((c) => c.id === parseInt(id))

  const getCountForSemester = (semId: string) => {
    const subjectIds = new Set(getSubjectsForSemester(semId).map((s) => s.id))
    return allDocuments.filter((doc) => doc.subject_id != null && subjectIds.has(doc.subject_id)).length
  }

  const getCountForSubject = (subjId: string) => {
    const id = parseInt(subjId)
    return allDocuments.filter((doc) => doc.subject_id === id).length
  }

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

  const breadcrumbs: BreadcrumbItem[] = [{ label: t('browse.root'), href: '/browse' }]
  if (semesterId) breadcrumbs.push({ label: getSemester(semesterId)?.name || semesterId, href: buildUrl({ semester: semesterId }) })
  if (subjectId) breadcrumbs.push({ label: getSubject(subjectId)?.name || subjectId, href: buildUrl({ semester: semesterId ?? undefined, subject: subjectId }) })
  if (categoryId) breadcrumbs.push({ label: getCategory(categoryId)?.name || categoryId, href: buildUrl({ semester: semesterId ?? undefined, subject: subjectId ?? undefined, category: categoryId }) })

  const documents = (semesterId && subjectId && categoryId)
    ? allDocuments.filter(
        (doc) => doc.subject_id === parseInt(subjectId) && doc.category_id === parseInt(categoryId)
      )
    : []

  const folderItems = (): FolderItem[] => {
    if (semesterId && subjectId) {
      return filters.categories.map((cat): FolderItem => ({
        key: cat.id,
        label: cat.name,
        href: buildUrl({ semester: semesterId, subject: subjectId, category: cat.id }),
        count: getCountForCategory(subjectId, String(cat.id)),
      }))
    }
    if (semesterId) {
      return getSubjectsForSemester(semesterId).map((subj): FolderItem => ({
        key: subj.id,
        label: subj.name,
        href: buildUrl({ semester: semesterId, subject: subj.id }),
        count: getCountForSubject(String(subj.id)),
      }))
    }
    return filters.semesters.map((sem): FolderItem => ({
      key: sem.id,
      label: sem.name,
      href: buildUrl({ semester: sem.id }),
      count: getCountForSemester(String(sem.id)),
    }))
  }

  return {
    loading: filtersLoading || docsLoading,
    semesterId,
    subjectId,
    categoryId,
    breadcrumbs,
    documents,
    folderItems: folderItems(),
    currentPath: searchParams.toString(),
  }
}
