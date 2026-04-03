'use client'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { OfflineBanner } from './OfflineBanner'

export function Header({ title }: { title: string }) {
  const t = useTranslations('auth')
  const { locale } = useParams<{ locale: string }>()
  return (
    <>
      <OfflineBanner />
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
            ↻
          </Button>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: `/${locale}/login` })}>
            {t('logout')}
          </Button>
        </div>
      </header>
    </>
  )
}
