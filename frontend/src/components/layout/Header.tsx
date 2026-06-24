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
import { cn } from '@/lib/utils'

const iconBtnClass =
  'rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'

export function Header() {
  const pathname = usePathname()
  const t = useTranslations()
  const isHome = pathname === '/'

  // On home, the Link won't remount SearchPage, so signal it to clear its search.
  const handleLogoClick = () => {
    if (isHome) {
      window.dispatchEvent(new Event(HOME_RESET_EVENT))
    }
  }

  return (
    <header className="sticky top-0 z-50 sm:border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* On mobile home the header is empty (logo in body, actions in tab bar) — collapse it. */}
      <div className={cn('flex items-center justify-between px-6', isHome ? 'h-0 sm:h-16' : 'h-16')}>
        {/* Logo lives in the page body on home, so the header keeps it empty there. */}
        {isHome ? (
          <span />
        ) : (
          <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2 hover:opacity-80">
            <Image src="/logo.svg" alt="StudyBuddy" width={36} height={33} priority />
            <span className="text-xl font-bold">StudyBuddy</span>
          </Link>
        )}

        {/* Mobile uses the bottom tab bar for these actions; show them only on desktop. */}
        <div className="hidden items-center gap-1 sm:flex">
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
