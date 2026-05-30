'use client'

import { use, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { api } from '@/api/client'
import { DocumentDetailView } from './DocumentDetailView'
import type { Document } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default function DocumentDetailPage({ params }: Props) {
  const { id } = use(params)
  const t = useTranslations()
  const [document, setDocument] = useState<Document | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // The access token lives in browser memory only, so fetching must happen
    // client-side via authedFetch — a Server Component has no token and 401s.
    api.getDocument(id)
      .then(setDocument)
      .catch((err: Error) => setError(err.message))
  }, [id])

  if (error) {
    return <p className="p-6 text-muted-foreground">{t('document.error')}: {error}</p>
  }

  if (!document) {
    return <p className="p-6 text-muted-foreground">{t('document.loadingPreview')}</p>
  }

  return <DocumentDetailView document={document} />
}
