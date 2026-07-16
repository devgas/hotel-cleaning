'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { BedDouble, CalendarDays, ClipboardList, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/board', labelKey: 'board', icon: BedDouble },
  { href: '/history', labelKey: 'history', icon: ClipboardList },
  { href: '/setup', labelKey: 'plan', icon: CalendarDays },
  { href: '/settings', labelKey: 'settings', icon: Settings },
] as const

export function BottomNav({ locale }: { locale: string }) {
  const pathname = usePathname()
  const t = useTranslations('nav')

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-20px_rgba(15,23,42,0.9)] backdrop-blur">
      {navItems.map((item) => {
        const href = `/${locale}${item.href}`
        const active = pathname.includes(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={href}
            className={cn(
              'relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              active ? 'bg-blue-50 text-blue-700' : 'text-slate-500'
            )}
            aria-current={active ? 'page' : undefined}
          >
            {active && <span className="absolute top-1 h-1 w-5 rounded-full bg-blue-600" aria-hidden="true" />}
            <span
              className={cn(
                'grid h-7 w-10 place-items-center rounded-full transition-colors',
                active ? 'text-blue-700' : 'text-slate-500'
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="leading-none">{t(item.labelKey)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
