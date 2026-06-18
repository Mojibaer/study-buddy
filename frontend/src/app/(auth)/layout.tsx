import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('auth')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border bg-card shadow-sm">
          <Image
            src="/logo.svg"
            alt={t('appName')}
            width={44}
            height={44}
            className="h-10 w-auto"
            priority
          />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('appName')}</h1>
        <p className="text-sm text-muted-foreground">{t('tagline')}</p>
      </div>
      <main className="w-full max-w-md">{children}</main>
    </div>
  )
}
