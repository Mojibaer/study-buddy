import { defineRouting } from 'next-intl/routing'

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE'
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

export const routing = defineRouting({
  locales: ['en', 'de'],
  defaultLocale: 'en',
  localePrefix: 'never',
  localeCookie: {
    name: LOCALE_COOKIE_NAME,
    maxAge: LOCALE_COOKIE_MAX_AGE,
  },
})

export type Locale = (typeof routing.locales)[number]
