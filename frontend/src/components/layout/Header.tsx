'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Upload, FolderOpen } from 'lucide-react'
import { UserPreferencesMenu } from '@/components/layout/UserPreferencesMenu'
import { SavedSidebar } from '@/components/layout/SavedSidebar'
import { UploadDialog } from '@/components/upload/UploadDialog'
import { HOME_RESET_EVENT } from '@/lib/events'

const iconBtnClass =
  'rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'

export function Header() {
  const pathname = usePathname()
  const t = useTranslations()

  // On home, the Link won't remount SearchPage, so signal it to clear its search.
  const handleLogoClick = () => {
    if (pathname === '/') {
      window.dispatchEvent(new Event(HOME_RESET_EVENT))
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-16 px-6">
        <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2 hover:opacity-80">
          <Image src="/logo.svg" alt="StudyBuddy" width={36} height={33} priority />
          <span className="text-xl font-bold">StudyBuddy</span>
        </Link>

        <div className="flex items-center gap-1">
          <UploadDialog
            trigger={
              <button type="button" aria-label={t('actions.upload')} title={t('actions.upload')} className={iconBtnClass}>
                <Upload className="h-5 w-5" />
              </button>
            }
          />
          <Link href="/browse" aria-label={t('actions.exploreFiles')} title={t('actions.exploreFiles')} className={iconBtnClass}>
            <FolderOpen className="h-5 w-5" />
          </Link>
          <SavedSidebar />
          <UserPreferencesMenu />
        </div>
      </div>
    </header>
  )
}
