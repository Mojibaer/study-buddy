'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, AlertCircle, Maximize2, Minimize2, X } from 'lucide-react'
import { getFileViewerUrl, cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import { PdfPreview } from '@/components/document/PdfPreview'
import type { Document } from '@/types'

interface FilePreviewProps {
  document: Document
  /** Open straight into the fullscreen overlay, skipping the inline Card. */
  defaultFullscreen?: boolean
  /** Called when leaving fullscreen in `defaultFullscreen` mode (no Card to collapse to). */
  onExitFullscreen?: () => void
}

// Renders the preview as a Card, or as a fullscreen overlay when expanded.
function PreviewShell({
  children,
  showExpand = false,
  defaultFullscreen = false,
  onExitFullscreen,
}: {
  children: (fullscreen: boolean) => React.ReactNode
  showExpand?: boolean
  defaultFullscreen?: boolean
  onExitFullscreen?: () => void
}) {
  const [fullscreen, setFullscreen] = useState(defaultFullscreen)
  const t = useTranslations()

  const exitFullscreen = () => {
    if (defaultFullscreen) {
      onExitFullscreen?.()
    } else {
      setFullscreen(false)
    }
  }

  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && exitFullscreen()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreen])

  // Own effect so the scroll lock is released even when unmounting from fullscreen.
  useEffect(() => {
    if (!fullscreen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [fullscreen])

  const header = (
    <div className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-2">
        <FileText className="w-5 h-5" />
        {t('document.preview')}
      </CardTitle>
      {(showExpand || defaultFullscreen) && (
        <button
          type="button"
          onClick={() => (fullscreen ? exitFullscreen() : setFullscreen(true))}
          aria-label={t(fullscreen ? 'document.collapse' : 'document.expand')}
          title={t(fullscreen ? 'document.collapse' : 'document.expand')}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {defaultFullscreen ? (
            <X className="w-4 h-4" />
          ) : fullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  )

  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex bg-background/80 backdrop-blur-sm p-4 sm:p-6"
        onClick={exitFullscreen}
      >
        <Card
          className="m-auto flex h-full w-full max-w-6xl flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="shrink-0">{header}</CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col">{children(true)}</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>{header}</CardHeader>
      <CardContent>{children(false)}</CardContent>
    </Card>
  )
}

export function FilePreview({ document, defaultFullscreen, onExitFullscreen }: FilePreviewProps) {
  const [error, setError] = useState(false)
  const t = useTranslations()
  const fileUrl = document.file_url
  const fileName = document.original_filename || document.filename || ''
  const fileExtension = fileName.split('.').pop()?.toLowerCase()
  const viewerUrl = fileUrl ? getFileViewerUrl(fileUrl, fileExtension) : null

  const shellProps = { defaultFullscreen, onExitFullscreen }

  if (!fileUrl) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t('document.previewUnavailableUrl')}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <PreviewShell {...shellProps}>
        {() => (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t('document.previewUnavailable')}</AlertDescription>
          </Alert>
        )}
      </PreviewShell>
    )
  }

  if (fileExtension === 'txt' || fileExtension === 'md') {
    return (
      <PreviewShell showExpand {...shellProps}>
        {(fullscreen) => (
          <TextFilePreview
            fileUrl={fileUrl}
            onError={() => setError(true)}
            isMarkdown={fileExtension === 'md'}
            fullscreen={fullscreen}
          />
        )}
      </PreviewShell>
    )
  }

  if (fileExtension === 'pdf') {
    return (
      <PreviewShell showExpand {...shellProps}>
        {(fullscreen) => (
          <div
            className={cn(
              'w-full border rounded-lg overflow-hidden bg-muted/30',
              fullscreen ? 'flex-1 min-h-0' : 'h-[600px]',
            )}
          >
            <PdfPreview fileUrl={fileUrl} onError={() => setError(true)} />
          </div>
        )}
      </PreviewShell>
    )
  }

  if (viewerUrl) {
    return (
      <PreviewShell showExpand {...shellProps}>
        {(fullscreen) => (
          <div
            className={cn(
              'w-full border rounded-lg overflow-hidden',
              fullscreen ? 'flex-1 min-h-0' : 'h-[600px]',
            )}
          >
            <iframe src={viewerUrl} className="w-full h-full" onError={() => setError(true)} title="Document Preview" />
          </div>
        )}
      </PreviewShell>
    )
  }

  return (
    <PreviewShell {...shellProps}>
      {() => (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>{t('document.previewTypeUnsupported')}</AlertDescription>
        </Alert>
      )}
    </PreviewShell>
  )
}

function TextFilePreview({
  fileUrl,
  onError,
  isMarkdown,
  fullscreen,
}: {
  fileUrl: string
  onError: () => void
  isMarkdown: boolean
  fullscreen: boolean
}) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const t = useTranslations()

  useEffect(() => {
    fetch(fileUrl)
      .then(res => res.text())
      .then(text => { setContent(text); setLoading(false) })
      .catch(() => { setLoading(false); onError() })
  }, [fileUrl, onError])

  if (loading) return <div className="text-center py-8 text-muted-foreground">{t('document.loadingPreview')}</div>

  const heightClass = fullscreen ? 'flex-1 min-h-0' : 'max-h-[600px]'

  if (isMarkdown) {
    return (
      <div
        className={cn(
          'w-full overflow-auto p-4 prose dark:prose-invert max-w-none',
          'prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl',
          'prose-a:text-primary',
          'prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5',
          'prose-code:text-foreground prose-code:font-normal',
          'prose-code:before:content-none prose-code:after:content-none',
          'prose-pre:bg-muted prose-pre:text-foreground prose-pre:border prose-pre:border-border',
          heightClass,
        )}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    )
  }

  return (
    <div className={cn('w-full overflow-auto', heightClass)}>
      <pre className="whitespace-pre-wrap text-sm p-4 bg-muted rounded-lg">{content}</pre>
    </div>
  )
}
