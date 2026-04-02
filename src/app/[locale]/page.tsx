import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/authOptions'

export default async function LocaleRootPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()
  if (session) redirect(`/${locale}/board`)
  redirect(`/${locale}/login`)
}
