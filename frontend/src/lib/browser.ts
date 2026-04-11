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
