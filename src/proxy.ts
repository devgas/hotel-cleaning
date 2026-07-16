import createMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'
import { routing } from './lib/i18n/routing'

const intlProxy = createMiddleware(routing)

// TODO Task 4/Task 11: Wire in NextAuth auth protection here once authOptions is configured
export default function proxy(request: NextRequest) {
  return intlProxy(request)
}

export const config = {
  matcher: [
    '/((?!$|api|_next/static|_next/image|favicon.ico|icons|manifest|sw.js|hotel-cleaning-app-icon.png|hotel-cleaning-desktop-bg.png|hotel-cleaning-mobile-bg.png|hotel-cleaning-management-preview.png).*)',
  ],
}
