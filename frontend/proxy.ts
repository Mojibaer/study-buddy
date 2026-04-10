import createMiddleware from 'next-intl/middleware'
import { routing } from './src/i18n/routing'

export const proxy = createMiddleware(routing)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
