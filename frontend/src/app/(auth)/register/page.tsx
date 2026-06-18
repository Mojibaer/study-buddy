'use client'

import Link from 'next/link'
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

export default function RegisterPage() {
  return (
    <GuestRoute>
      <RegisterForm />
    </GuestRoute>
  )
}

function RegisterForm() {
  const t = useTranslations('auth')
  const tv = useTranslations('auth.validation')
  const { register } = useAuth()

  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {}
    if (!email) errors.email = tv('emailRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = tv('emailInvalid')
    else if (!email.toLowerCase().endsWith(EMAIL_DOMAIN)) errors.email = tv('emailDomain')
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
      await register({ email })
      setSubmittedEmail(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (submittedEmail) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('register.successTitle')}</CardTitle>
          <CardDescription>
            {t('register.successMessage', { email: submittedEmail })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="text-sm text-primary underline-offset-4 hover:underline">
            {t('login.title')}
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('register.title')}</CardTitle>
        <CardDescription>{t('register.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" aria-hidden />
              <AlertTitle>{t('register.errorTitle')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t('register.emailLabel')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t('register.emailPlaceholder')}
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
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? t('register.submitting') : t('register.submit')}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t('register.haveAccount')}{' '}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              {t('register.loginLink')}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
