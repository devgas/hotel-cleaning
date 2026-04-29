'use client'
import { useSyncExternalStore } from 'react'
import { useSelector } from 'react-redux'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Header } from '@/components/common/Header'
import { SummaryCounters } from '@/components/board/SummaryCounters'
import { BoardTabs } from '@/components/board/BoardTabs'
import { RoomCard } from '@/components/board/RoomCard'
import { useGetPlanByDateQuery } from '@/store/api/dailyPlanApi'
import { useGetSettingsQuery } from '@/store/api/settingsApi'
import { isStayoverRoomType } from '@/lib/roomTypes'
import type { RootState } from '@/store'
import type { RoomWithStatus } from '@/types'
import Link from 'next/link'

const POLL_INTERVAL = 15000

// Easter decoration — remove after 2026-04-14
const EASTER_END = new Date('2026-04-14T23:59:59')
function isEaster() {
  return new Date() <= EASTER_END
}

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

export default function BoardPage() {
  const t = useTranslations('board')
  const { locale } = useParams<{ locale: string }>()
  const activeTab = useSelector((s: RootState) => s.ui.boardTab)
  const isOnline = useSelector((s: RootState) => s.ui.isOnline)

  const todayDate = useSyncExternalStore(() => () => undefined, getClientDate, () => '')

  const { data: plan, isLoading } = useGetPlanByDateQuery(todayDate, {
    skip: !todayDate,
    pollingInterval: POLL_INTERVAL,
  })
  const { data: settings } = useGetSettingsQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">...</p>
      </div>
    )
  }

  if (!plan) {
    return (
      <div>
        <Header title={t('title')} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4">
          <p className="text-gray-500">{t('noPlan')}</p>
          <Link
            href={`/${locale}/setup`}
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
          >
            {t('goToSetup')}
          </Link>
        </div>
      </div>
    )
  }

  const rooms = plan.rooms
  const cleaned = rooms.filter((r) => r.status === 'cleaned').length
  const notNeeded = rooms.filter((r) => r.status === 'not_needed').length
  const notCleaned = rooms.filter((r) => r.status === 'not_cleaned_yet').length

  function tabStats(subset: typeof rooms) {
    return {
      total: subset.length,
      cleaned: subset.filter((r) => r.status === 'cleaned').length,
      notCleaned: subset.filter((r) => r.status === 'not_cleaned_yet').length,
    }
  }

  const tabCounts = {
    all: tabStats(rooms),
    priority: tabStats(rooms.filter((r) => r.priority)),
    checkout: tabStats(rooms.filter((r) => r.roomType === 'checkout')),
    stayover: tabStats(rooms.filter((r) => isStayoverRoomType(r.roomType))),
  }

  const filtered: RoomWithStatus[] = rooms.filter((r) => {
    if (activeTab === 'checkout') return r.roomType === 'checkout'
    if (activeTab === 'stayover') return isStayoverRoomType(r.roomType)
    return true
  })

  const showEaster = isEaster()

  return (
    <div>
      <Header title={t('title')} />
      <div className="sticky top-[52px] z-30 bg-white shadow-[0_2px_8px_0_rgba(0,0,0,0.06)]">
        {showEaster && (
          <div className="text-center text-sm py-1 bg-gradient-to-r from-yellow-50 via-pink-50 to-purple-50">
            🕯️ {t('happyEaster')} 🌷🥚🐣🌸
          </div>
        )}
        <SummaryCounters total={rooms.length} cleaned={cleaned} notNeeded={notNeeded} notCleaned={notCleaned} />
        <BoardTabs counts={tabCounts} />
      </div>
      <div className="px-3 pt-2 pb-4 space-y-1.5">
        {filtered.map((room) => (
          <RoomCard
            key={room.dailyPlanRoomId}
            room={room}
            whatsappEnabled={settings?.whatsappEnabled ?? false}
            whatsappChatLink={settings?.whatsappChatLink ?? ''}
            whatsappPhone={settings?.whatsappPhone ?? ''}
            whatsappTemplate={settings?.whatsappMessageTemplate ?? ''}
            whatsappAllowAfterCleaned={settings?.whatsappAllowAfterCleaned ?? false}
            isOnline={isOnline}
          />
        ))}
      </div>
    </div>
  )
}
