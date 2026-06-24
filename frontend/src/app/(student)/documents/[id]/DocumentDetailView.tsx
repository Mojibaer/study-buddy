'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeaderBar,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ArrowLeft, FolderTree, PanelRight, Info } from 'lucide-react'
import { DocumentMetadata } from '@/components/document/DocumentMetadata'
import { FilePreview } from '@/components/document/FilePreview'
import { DocumentActions } from '@/components/document/DocumentActions'
import type { Document } from '@/types'

interface DocumentDetailViewProps {
  document: Document
}

export function DocumentDetailView({ document }: DocumentDetailViewProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations()

  const fromPath = searchParams.get('from')
  const isFromBrowse = fromPath?.startsWith('/browse')

  const handleBack = () => {
    if (fromPath) router.push(fromPath)
    else router.back()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-2 py-4 sm:px-4 sm:py-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={handleBack}>
              {isFromBrowse ? (
                <><FolderTree className="w-4 h-4 mr-2" />{t('document.backToBrowse')}</>
              ) : (
                <><ArrowLeft className="w-4 h-4 mr-2" />{t('document.backToSearch')}</>
              )}
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <PanelRight className="w-4 h-4 mr-2" />
                  {t('document.detailsAndActions')}
                </Button>
              </SheetTrigger>
              <SheetContent showCloseButton={false} className="flex w-full flex-col gap-0 p-0 sm:max-w-sm">
                <SheetHeaderBar
                  icon={<Info className="h-5 w-5 text-primary" />}
                  title={t('document.detailsAndActions')}
                  closeLabel={t('actions.close')}
                />
                <div className="flex-1 space-y-6 overflow-y-auto p-5">
                  <DocumentMetadata document={document} />
                  <DocumentActions document={document} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <FilePreview document={document} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
