'use client'

import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations()
  return (
    <footer className="hidden border-t py-6 sm:block">
      <div className="container mx-auto px-4 flex gap-6 flex-wrap items-center justify-center text-sm text-muted-foreground">
        {t('footer.text')}
      </div>
    </footer>
  )
}
