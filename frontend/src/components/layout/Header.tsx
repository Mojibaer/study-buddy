'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Upload, FolderOpen } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UploadForm } from '@/components/UploadForm'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'

export function Header() {
  const [open, setOpen] = useState(false)
  const t = useTranslations()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="text-2xl font-bold hover:opacity-80">
          Study Buddy
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/browse">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              <FolderOpen className="w-4 h-4 mr-2" />
              {t('header.exploreFiles')}
            </Button>
          </Link>

          <Link href="/browse">
            <Button variant="outline" size="icon" className="sm:hidden">
              <FolderOpen className="w-4 h-4" />
              <span className="sr-only">{t('header.exploreFiles')}</span>
            </Button>
          </Link>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <Upload className="w-4 h-4 mr-2" />
                {t('header.upload')}
              </Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="sm:hidden">
                <Upload className="w-4 h-4" />
                <span className="sr-only">{t('header.upload')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('header.uploadDialogTitle')}</DialogTitle>
              </DialogHeader>
              <UploadForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>

          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
