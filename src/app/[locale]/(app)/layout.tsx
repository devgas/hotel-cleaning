import { BottomNav } from '@/components/common/BottomNav'
import { auth } from '@/lib/auth/authOptions'
import { redirect } from 'next/navigation'

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()
  if (!session) redirect(`/${locale}/login`)

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-20">{children}</main>
      <BottomNav locale={locale} />
    </div>
  )
}
