'use client'

import { useState } from 'react'
import { copyToClipboard } from '@/lib/utils'

export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false)

  const copy = async (text) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), resetDelay)
    }
  }

  return { copied, copy }
}
