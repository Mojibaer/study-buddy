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

  function validate(): string | null {
    if (!verifyToken) return t('setup.missingToken')
    if (!username) return tv('usernameRequired')
    if (username.length < USERNAME_MIN_LENGTH) return tv('usernameMinLength')
    if (!password) return tv('passwordRequired')
    if (password.length < PASSWORD_MIN_LENGTH) return tv('passwordMinLength')
    if (password !== passwordConfirm) return t('setup.passwordMismatch')
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
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
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
              className={AUTH_INPUT_CLASS}
              required
            />
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
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className={AUTH_INPUT_CLASS}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">{t('setup.passwordConfirmLabel')}</Label>
              <Input
                id="passwordConfirm"
                type="password"
                autoComplete="new-password"
                placeholder={t('setup.passwordConfirmPlaceholder')}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                disabled={submitting}
                className={AUTH_INPUT_CLASS}
                required
              />
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
