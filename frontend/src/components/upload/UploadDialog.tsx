'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UploadForm } from '@/components/upload/UploadForm'

const pillClass =
  'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border bg-card text-sm text-foreground hover:bg-accent transition-colors'

export function UploadDialog() {
  const [open, setOpen] = useState(false)
  const t = useTranslations()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className={pillClass}>
          <Upload className="w-3.5 h-3.5" />
          {t('actions.upload')}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('actions.uploadDialogTitle')}</DialogTitle>
          <DialogDescription>{t('actions.uploadDialogDescription')}</DialogDescription>
        </DialogHeader>
        <UploadForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
