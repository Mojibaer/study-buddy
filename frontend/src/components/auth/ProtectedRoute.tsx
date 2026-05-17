'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/providers/AuthProvider'
import type { UserRole } from '@/types/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  /**
   * Optional: nur User mit dieser Rolle dürfen rein. Ohne Wert reicht ein
   * eingeloggter, aktiver User.
   */
  requireRole?: UserRole
  /**
   * Wohin redirected wird, wenn unauthentifiziert. Default: /login
   */
  loginRedirect?: string
  /**
   * Wohin redirected wird, wenn eingeloggt aber falsche Rolle. Default: /
   */
  forbiddenRedirect?: string
}

export function ProtectedRoute({
  children,
  requireRole,
  loginRedirect = '/login',
  forbiddenRedirect = '/',
}: ProtectedRouteProps): React.ReactNode {
  const router = useRouter()
  const pathname = usePathname()
  const { status, user } = useAuth()
  const t = useTranslations('auth.guard')

  useEffect(() => {
    if (status === 'unauthenticated') {
      const next = encodeURIComponent(pathname || '/')
      router.replace(`${loginRedirect}?next=${next}`)
      return
    }
    if (status === 'authenticated' && requireRole && user?.role !== requireRole) {
      router.replace(forbiddenRedirect)
    }
  }, [status, user, requireRole, router, pathname, loginRedirect, forbiddenRedirect])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-muted-foreground">{t('loading')}</span>
      </div>
    )
  }

  if (status === 'unauthenticated') return null
  if (requireRole && user?.role !== requireRole) return null

  return <>{children}</>
}
