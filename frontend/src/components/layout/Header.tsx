import Image from 'next/image'
import Link from 'next/link'
import { UserPreferencesMenu } from '@/components/layout/UserPreferencesMenu'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-16 px-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80">
          <Image src="/logo.svg" alt="StudyBuddy" width={36} height={33} priority />
          <span className="text-xl font-bold">StudyBuddy</span>
        </Link>

        <UserPreferencesMenu />
      </div>
    </header>
  )
}
