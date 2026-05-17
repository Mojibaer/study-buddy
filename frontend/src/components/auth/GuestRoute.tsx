'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/providers/AuthProvider'

/**
 * Inverse von ProtectedRoute: eingeloggte User werden weggeleitet (Default: /).
 * Setup-Page bekommt eine Sonderbehandlung — siehe allowWhenAuthenticated.
 */
export function GuestRoute({
  children,
  redirectTo = '/',
  allowWhenAuthenticated = false,
}: {
  children: React.ReactNode
  redirectTo?: string
  allowWhenAuthenticated?: boolean
}): React.ReactNode {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useAuth()
  const t = useTranslations('auth.guard')

  useEffect(() => {
    if (allowWhenAuthenticated) return
    if (status === 'authenticated') {
      const next = searchParams.get('next')
      router.replace(next || redirectTo)
    }
  }, [status, router, searchParams, redirectTo, allowWhenAuthenticated])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-10">
        <span className="text-sm text-muted-foreground">{t('loading')}</span>
      </div>
    )
  }

  if (status === 'authenticated' && !allowWhenAuthenticated) return null
  return <>{children}</>
}
