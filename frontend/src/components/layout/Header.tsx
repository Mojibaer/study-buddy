'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserPreferencesMenu } from '@/components/layout/UserPreferencesMenu'
import { SavedSidebar } from '@/components/layout/SavedSidebar'
import { HOME_RESET_EVENT } from '@/lib/events'

export function Header() {
  const pathname = usePathname()

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
          <SavedSidebar />
          <UserPreferencesMenu />
        </div>
      </div>
    </header>
  )
}
