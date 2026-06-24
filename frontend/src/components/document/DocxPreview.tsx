'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { renderAsync } from 'docx-preview'
import { Loader2 } from 'lucide-react'

interface DocxPreviewProps {
  fileUrl: string
  onError: () => void
}

// Renders DOCX client-side into a scrollable container — self-hosted, so files
// never leave the browser (unlike the Office Online viewer) and it works on mobile.
export function DocxPreview({ fileUrl, onError }: DocxPreviewProps) {
  const t = useTranslations()
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetch(fileUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.blob()
      })
      .then((blob) => {
        if (cancelled || !containerRef.current) return
        return renderAsync(blob, containerRef.current)
      })
      .then(() => {
        if (!cancelled) setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false)
          onError()
        }
      })

    return () => {
      cancelled = true
    }
  }, [fileUrl, onError])

  return (
    <div className="h-full w-full overflow-auto bg-white">
      {loading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {t('document.loadingPreview')}
        </div>
      )}
      <div ref={containerRef} />
    </div>
  )
}
