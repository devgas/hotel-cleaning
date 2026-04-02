'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/board', labelKey: 'board', icon: '🏨' },
  { href: '/history', labelKey: 'history', icon: '📋' },
  { href: '/setup', labelKey: 'plan', icon: '🗂️' },
  { href: '/settings', labelKey: 'settings', icon: '⚙️' },
] as const

export function BottomNav({ locale }: { locale: string }) {
  const pathname = usePathname()
  const t = useTranslations('nav')

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 flex">
      {navItems.map((item) => {
        const href = `/${locale}${item.href}`
        const active = pathname.includes(item.href)
        return (
          <Link
            key={item.href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors',
              active ? 'text-blue-600 font-medium' : 'text-gray-500'
            )}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{t(item.labelKey)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
