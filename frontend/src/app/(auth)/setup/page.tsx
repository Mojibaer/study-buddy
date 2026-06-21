'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/providers/AuthProvider'

const PASSWORD_MIN_LENGTH = 12
const USERNAME_MIN_LENGTH = 3

const AUTH_INPUT_CLASS =
  'h-10 border-input/80 bg-card transition-colors hover:border-ring/60 focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px]'

export default function SetupPage() {
  const t = useTranslations('auth')
  const tv = useTranslations('auth.validation')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setup } = useAuth()

  const verifyToken = searchParams.get('token') ?? ''

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function clearFieldError(field: string): void {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function validate(): { formError?: string; fieldErrors: Record<string, string> } {
    if (!verifyToken) return { formError: t('setup.missingToken'), fieldErrors: {} }
    const errors: Record<string, string> = {}
    if (!username) errors.username = tv('usernameRequired')
    else if (username.length < USERNAME_MIN_LENGTH) errors.username = tv('usernameMinLength')
    if (!password) errors.password = tv('passwordRequired')
    else if (password.length < PASSWORD_MIN_LENGTH) errors.password = tv('passwordMinLength')
    if (password !== passwordConfirm) errors.passwordConfirm = t('setup.passwordMismatch')
    return { fieldErrors: errors }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const { formError, fieldErrors: errors } = validate()
    if (formError) {
      setError(formError)
      return
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setSubmitting(true)
    setError(null)
    try {
      await setup({ token: verifyToken, username, password })
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('setup.title')}</CardTitle>
        <CardDescription>{t('setup.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" aria-hidden />
              <AlertTitle>{t('setup.errorTitle')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="username">{t('setup.usernameLabel')}</Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              placeholder={t('setup.usernamePlaceholder')}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                clearFieldError('username')
              }}
              disabled={submitting}
              className={AUTH_INPUT_CLASS}
              aria-invalid={!!fieldErrors.username}
              aria-describedby={fieldErrors.username ? 'username-error' : undefined}
              required
            />
            {fieldErrors.username && (
              <p id="username-error" className="text-sm text-destructive">
                {fieldErrors.username}
              </p>
            )}
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('setup.passwordLabel')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder={t('setup.passwordPlaceholder')}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  clearFieldError('password')
                  clearFieldError('passwordConfirm')
                }}
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
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">{t('setup.passwordConfirmLabel')}</Label>
              <Input
                id="passwordConfirm"
                type="password"
                autoComplete="new-password"
                placeholder={t('setup.passwordConfirmPlaceholder')}
                value={passwordConfirm}
                onChange={(e) => {
                  setPasswordConfirm(e.target.value)
                  clearFieldError('passwordConfirm')
                }}
                disabled={submitting}
                className={AUTH_INPUT_CLASS}
                aria-invalid={!!fieldErrors.passwordConfirm}
                aria-describedby={fieldErrors.passwordConfirm ? 'passwordConfirm-error' : undefined}
                required
              />
              {fieldErrors.passwordConfirm && (
                <p id="passwordConfirm-error" className="text-sm text-destructive">
                  {fieldErrors.passwordConfirm}
                </p>
              )}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? t('setup.submitting') : t('setup.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
