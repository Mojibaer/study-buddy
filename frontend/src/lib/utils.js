import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Format date
export function formatDate(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

// Calculate match percentage
export function calculateMatchScore(distance) {
  return ((1 - distance) * 100).toFixed(1)
}

// Truncate text
export function truncateText(text, maxLength = 200) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}