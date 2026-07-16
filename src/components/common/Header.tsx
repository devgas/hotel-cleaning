'use client'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LogOut, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getDailyWish } from '@/lib/headerDailyWish'
import { OfflineBanner } from './OfflineBanner'

export function Header({ title }: { title: string }) {
  const t = useTranslations('auth')
  const { locale } = useParams<{ locale: string }>()
  const dailyWish = getDailyWish(locale)

  return (
    <>
      <OfflineBanner />
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold leading-tight text-slate-950">{title}</h1>
          <p className="truncate text-xs font-medium text-slate-500">{dailyWish}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
            className="h-10 w-10 px-0 text-slate-600"
            aria-label="Refresh"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
            className="h-10 gap-1.5 px-2 text-slate-600"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden min-[380px]:inline">{t('logout')}</span>
          </Button>
        </div>
      </header>
    </>
  )
}
