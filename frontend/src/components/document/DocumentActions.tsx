'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Share2, Mail, MessageCircle, Link2, Check } from 'lucide-react'
import { shareViaWhatsApp, shareViaEmail } from '@/lib/browser'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import type { Document } from '@/types'

interface DocumentActionsProps {
  document: Document
}

export function DocumentActions({ document }: DocumentActionsProps) {
  const { copied, copy } = useCopyToClipboard()
  const t = useTranslations()
  const [documentUrl, setDocumentUrl] = useState('')
  useEffect(() => { setDocumentUrl(window.location.href) }, [])
  const documentTitle = document.original_filename || document.filename

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          {t('document.actions')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={() => document.file_url && window.open(document.file_url, '_blank')}
          disabled={!document.file_url}
          className="w-full"
          size="lg"
        >
          <Download className="w-4 h-4 mr-2" />
          {t('document.download')}
        </Button>

        <div className="pt-2 border-t">
          <div className="text-sm font-medium mb-3">{t('document.shareVia')}</div>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => shareViaWhatsApp(documentUrl, documentTitle)} className="flex flex-col h-auto py-3">
              <MessageCircle className="w-5 h-5 mb-1" />
              <span className="text-xs">WhatsApp</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => shareViaEmail(documentUrl, documentTitle)} className="flex flex-col h-auto py-3">
              <Mail className="w-5 h-5 mb-1" />
              <span className="text-xs">Email</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => copy(documentUrl)} className="flex flex-col h-auto py-3">
              {copied ? (
                <><Check className="w-5 h-5 mb-1" /><span className="text-xs">{t('document.copied')}</span></>
              ) : (
                <><Link2 className="w-5 h-5 mb-1" /><span className="text-xs">{t('document.link')}</span></>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
