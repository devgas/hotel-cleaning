import createMiddleware from 'next-intl/middleware'
import { routing } from './lib/i18n/routing'

// TODO Task 4/Task 11: Wire in NextAuth auth protection here once authOptions is configured
export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|manifest).*)'],
}
