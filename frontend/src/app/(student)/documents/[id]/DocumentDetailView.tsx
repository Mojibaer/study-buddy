'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ArrowLeft, FolderTree, PanelRight } from 'lucide-react'
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
      <main className="flex-1 container mx-auto px-4 py-8">
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
              <SheetContent className="w-full overflow-y-auto sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle>{t('document.detailsAndActions')}</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 px-4 pb-4">
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
