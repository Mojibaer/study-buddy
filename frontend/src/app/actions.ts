'use server'

import { cookies } from 'next/headers'
import { LOCALE_COOKIE_NAME, LOCALE_COOKIE_MAX_AGE, type Locale } from '@/i18n/routing'

export async function setLocale(locale: Locale) {
  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
  })
}
