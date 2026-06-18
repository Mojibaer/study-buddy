'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GuestRoute } from '@/components/auth/GuestRoute'
import { useAuth } from '@/providers/AuthProvider'

const EMAIL_DOMAIN = '@edu.fh-joanneum.at'

const AUTH_INPUT_CLASS =
  'h-10 border-input/80 bg-card transition-colors hover:border-ring/60 focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px]'

export default function LoginPage() {
  return (
    <GuestRoute>
      <LoginForm />
    </GuestRoute>
  )
}

function LoginForm() {
  const t = useTranslations('auth')
  const tv = useTranslations('auth.validation')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {}
    if (!email) errors.email = tv('emailRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = tv('emailInvalid')
    else if (!email.toLowerCase().endsWith(EMAIL_DOMAIN)) errors.email = tv('emailDomain')
    if (!password) errors.password = tv('passwordRequired')
    return errors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setSubmitting(true)
    setError(null)
    try {
      await login({ email, password })
      const next = searchParams.get('next')
      router.push(next || '/')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('login.title')}</CardTitle>
        <CardDescription>{t('login.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" aria-hidden />
              <AlertTitle>{t('login.errorTitle')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t('login.emailLabel')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t('login.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className={AUTH_INPUT_CLASS}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              required
            />
            {fieldErrors.email && (
              <p id="email-error" className="text-sm text-destructive">
                {fieldErrors.email}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('login.passwordLabel')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder={t('login.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              className={AUTH_INPUT_CLASS}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              required
            />
            {fieldErrors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {fieldErrors.password}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? t('login.submitting') : t('login.submit')}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t('login.noAccount')}{' '}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              {t('login.registerLink')}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
