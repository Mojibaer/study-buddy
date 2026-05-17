import createIntlMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import { routing } from './src/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

// Auth- und Role-Checks laufen client-seitig in ProtectedRoute (AUTH-10).
// Die echte Absicherung sitzt im Backend (require_admin, get_current_active_user).
export default function middleware(request: NextRequest) {
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|.*\\..*).*)',
  ],
}
