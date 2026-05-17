import { api } from '@/api/client'
import { DocumentDetailView } from './DocumentDetailView'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const document = await api.getDocument(id)
    const title = document.original_filename || document.filename
    return {
      title: `${title} — StudyBuddy`,
      openGraph: { title: `${title} — StudyBuddy` },
    }
  } catch {
    return { title: 'Dokument — StudyBuddy' }
  }
}

export default async function DocumentDetailPage({ params }: Props) {
  const { id } = await params
  const document = await api.getDocument(id)

  return <DocumentDetailView document={document} />
}
