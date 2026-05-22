'use client'
import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { useGetPlanByDateQuery } from '@/store/api/dailyPlanApi'
import {
  createBoardViewSnapshot,
  hasUnreadBoardChanges,
  readBoardViewSnapshot,
  subscribeToBoardUnreadChanges,
} from '@/lib/boardUnread'

const navItems = [
  { href: '/board', labelKey: 'board', icon: '🏨' },
  { href: '/history', labelKey: 'history', icon: '📋' },
  { href: '/setup', labelKey: 'plan', icon: '🗂️' },
  { href: '/settings', labelKey: 'settings', icon: '⚙️' },
] as const

const POLL_INTERVAL = 15000

function getTodayDate() {
  const d = new Date()
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

let cachedDate = ''
function getClientDate() {
  const next = getTodayDate()
  if (next !== cachedDate) cachedDate = next
  return cachedDate
}

export function BottomNav({ locale }: { locale: string }) {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const todayDate = useSyncExternalStore(() => () => undefined, getClientDate, () => '')
  const { data: plan } = useGetPlanByDateQuery(todayDate, {
    skip: !todayDate,
    pollingInterval: POLL_INTERVAL,
  })

  useSyncExternalStore(
    subscribeToBoardUnreadChanges,
    () => readBoardViewSnapshot(todayDate)?.signature ?? '',
    () => ''
  )

  const hasBoardUnread =
    !!todayDate &&
    hasUnreadBoardChanges(
      createBoardViewSnapshot(todayDate, plan?.rooms),
      readBoardViewSnapshot(todayDate)
    )

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 flex">
      {navItems.map((item) => {
        const href = `/${locale}${item.href}`
        const active = pathname.includes(item.href)
        const showUnreadDot = item.href === '/board' && hasBoardUnread
        return (
          <Link
            key={item.href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors',
              active ? 'text-blue-600 font-medium' : 'text-gray-500'
            )}
          >
            <span className="relative text-xl">
              {item.icon}
              {showUnreadDot && (
                <span className="absolute -right-1 -top-0.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </span>
            <span>{t(item.labelKey)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
