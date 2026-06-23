import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

// Backend already returns score as 1 - distance (0..1, higher is better).
export function calculateMatchScore(score: number): string {
  return (score * 100).toFixed(1)
}

/**
 * Tailwind classes for the match-score badge, colour-coded by the real score:
 * strong (green) ≥ 85, good (primary) ≥ 75, weak (muted) below.
 */
export function matchScoreBadgeClass(score: number): string {
  const pct = score * 100
  if (pct >= 85) return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
  if (pct >= 75) return 'bg-primary/15 text-primary'
  return 'bg-muted text-muted-foreground'
}

/**
 * Tailwind classes for the file-type icon tile, by extension/type.
 */
export function fileTypeIconClass(fileType?: string, filename?: string): string {
  const t = (fileType || filename || '').toLowerCase()
  if (t.includes('pdf')) return 'bg-orange-500/15 text-orange-600 dark:text-orange-400'
  if (t.includes('md') || t.includes('markdown')) return 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
  if (t.includes('doc')) return 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
  return 'bg-muted text-muted-foreground'
}

export function truncateText(text: string, maxLength = 200): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getFileViewerUrl(fileUrl: string, fileType: string | undefined): string | null {
  if (fileType === 'pdf' || fileUrl.toLowerCase().endsWith('.pdf')) {
    return fileUrl
  }

  if (fileType === 'docx' || fileUrl.toLowerCase().endsWith('.docx') || fileUrl.toLowerCase().endsWith('.doc')) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`
  }

  return null
}

export function isMarkdownFile(fileUrl: string, fileType: string): boolean {
  return fileType === '.md' || fileUrl.toLowerCase().endsWith('.md')
}
