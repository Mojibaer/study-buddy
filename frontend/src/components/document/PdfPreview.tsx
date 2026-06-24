'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Document, Page, pdfjs } from 'react-pdf'
import { Loader2 } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Self-hosted worker from the bundled pdfjs-dist — no CDN, no public/ copy.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

interface PdfPreviewProps {
  fileUrl: string
  onError: () => void
  zoom: number
}

// Renders every page stacked and scrollable; page width tracks the container so
// it fits mobile (the iframe viewer doesn't render PDFs on mobile browsers).
export function PdfPreview({ fileUrl, onError, zoom }: PdfPreviewProps) {
  const t = useTranslations()
  const containerRef = useRef<HTMLDivElement>(null)
  const [numPages, setNumPages] = useState(0)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="h-full w-full overflow-auto">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={onError}
        loading={
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t('document.loadingPreview')}
          </div>
        }
        // min-w-fit + mx-auto keeps narrow content centered but lets zoomed
        // pages overflow on BOTH sides (items-center clips the left edge and
        // makes the start unscrollable). w-fit so the flex track sizes to the
        // widest page, not the container.
        className="flex w-fit min-w-full flex-col items-center gap-4"
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={i}
            pageNumber={i + 1}
            width={width ? width * zoom : undefined}
            className="shadow-sm"
            renderAnnotationLayer={false}
          />
        ))}
      </Document>
    </div>
  )
}
