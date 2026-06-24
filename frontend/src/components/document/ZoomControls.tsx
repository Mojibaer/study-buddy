'use client'

import { useTranslations } from 'next-intl'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

export const ZOOM_MIN = 0.5
export const ZOOM_MAX = 2.5
export const ZOOM_STEP = 0.25

interface ZoomControlsProps {
  zoom: number
  setZoom: (updater: (z: number) => number) => void
}

const clamp = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z))

// Inline zoom toolbar shared by the PDF and DOCX previews; sits in the preview
// header next to the expand button. Scales content only.
export function ZoomControls({ zoom, setZoom }: ZoomControlsProps) {
  const t = useTranslations()
  const btn =
    'rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40'

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={() => setZoom((z) => clamp(z - ZOOM_STEP))}
        disabled={zoom <= ZOOM_MIN}
        aria-label={t('document.zoomOut')}
        title={t('document.zoomOut')}
        className={btn}
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <span className="min-w-[3ch] text-center text-xs tabular-nums text-muted-foreground">
        {Math.round(zoom * 100)}%
      </span>
      <button
        type="button"
        onClick={() => setZoom((z) => clamp(z + ZOOM_STEP))}
        disabled={zoom >= ZOOM_MAX}
        aria-label={t('document.zoomIn')}
        title={t('document.zoomIn')}
        className={btn}
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setZoom(() => 1)}
        disabled={zoom === 1}
        aria-label={t('document.zoomReset')}
        title={t('document.zoomReset')}
        className={btn}
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  )
}
