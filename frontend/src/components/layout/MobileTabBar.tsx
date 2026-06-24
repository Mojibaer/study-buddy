'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Search, FolderOpen, Plus, Bookmark, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBookmarks } from '@/providers/BookmarksProvider'
import { HOME_RESET_EVENT } from '@/lib/events'
import { UploadDialog } from '@/components/upload/UploadDialog'
import { SavedSidebar } from '@/components/layout/SavedSidebar'
import { UserPreferencesMenu } from '@/components/layout/UserPreferencesMenu'

const tabClass = 'flex flex-1 items-center justify-center text-muted-foreground transition-colors'
const activeClass = 'text-primary'

// Native-style bottom tab bar, mobile only. Desktop keeps the header actions.
export function MobileTabBar() {
  const pathname = usePathname()
  const t = useTranslations()
  const { count } = useBookmarks()

  const isHome = pathname === '/'
  const isBrowse = pathname.startsWith('/browse')

  const onHomeClick = () => {
    if (isHome) window.dispatchEvent(new Event(HOME_RESET_EVENT))
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)] sm:hidden">
      <div className="flex h-16 items-center">
        <Link
          href="/"
          onClick={onHomeClick}
          aria-label={t('search.heading')}
          className={cn(tabClass, isHome && activeClass)}
        >
          <Search className="h-6 w-6" />
        </Link>

        <Link
          href="/browse"
          aria-label={t('actions.exploreFiles')}
          className={cn(tabClass, isBrowse && activeClass)}
        >
          <FolderOpen className="h-6 w-6" />
        </Link>

        <UploadDialog
          trigger={
            <button type="button" aria-label={t('actions.upload')} className={tabClass}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Plus className="h-5 w-5" />
              </span>
            </button>
          }
        />

        <SavedSidebar
          trigger={
            <button type="button" aria-label={t('bookmarks.title')} className={tabClass}>
              <span className="relative">
                <Bookmark className="h-6 w-6" />
                {count > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                    {count}
                  </span>
                )}
              </span>
            </button>
          }
        />

        <UserPreferencesMenu
          trigger={
            <button type="button" aria-label={t('auth.menu.signedInAs')} className={tabClass}>
              <User className="h-6 w-6" />
            </button>
          }
        />
      </div>
    </nav>
  )
}
