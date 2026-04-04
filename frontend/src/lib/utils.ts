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

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function calculateMatchScore(distance: number): string {
  return ((1 - distance) * 100).toFixed(1)
}

export function truncateText(text: string, maxLength = 200): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function shareViaWhatsApp(url: string, title: string): void {
  const text = `Dokument: ${title}\n${url}`
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}

export function shareViaEmail(url: string, title: string): void {
  const subject = `Study Buddy: ${title}`
  const body = `Schau dir dieses Dokument an:\n\n${title}\n${url}`
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
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
