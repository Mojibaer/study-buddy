import createIntlMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './src/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

// Admin auth enforcement will be wired here once AUTH-05 is complete.
// For now, /admin/* routes return 401 for all requests.
function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin')
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isAdminRoute(pathname)) {
    // TODO(AUTH-05): replace with real JWT role check
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|.*\\..*).*)',
  ],
}
