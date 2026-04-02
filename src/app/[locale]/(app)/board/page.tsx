'use client'
import { useSelector } from 'react-redux'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Header } from '@/components/common/Header'
import { SummaryCounters } from '@/components/board/SummaryCounters'
import { BoardTabs } from '@/components/board/BoardTabs'
import { RoomCard } from '@/components/board/RoomCard'
import { useGetTodayPlanQuery } from '@/store/api/dailyPlanApi'
import { useGetSettingsQuery } from '@/store/api/settingsApi'
import type { RootState } from '@/store'
import type { RoomWithStatus } from '@/types'
import Link from 'next/link'

const POLL_INTERVAL = 15000

export default function BoardPage() {
  const t = useTranslations('board')
  const { locale } = useParams<{ locale: string }>()
  const activeTab = useSelector((s: RootState) => s.ui.boardTab)
  const isOnline = useSelector((s: RootState) => s.ui.isOnline)

  const { data: plan, isLoading } = useGetTodayPlanQuery(undefined, {
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

  const filtered: RoomWithStatus[] = rooms.filter((r) => {
    if (activeTab === 'all') return true
    if (activeTab === 'priority') return r.priority
    if (activeTab === 'checkout') return r.roomType === 'checkout'
    if (activeTab === 'stayover') return r.roomType === 'stayover'
    return true
  })

  return (
    <div>
      <Header title={t('title')} />
      <div className="sticky top-[52px] z-30 bg-white shadow-[0_2px_8px_0_rgba(0,0,0,0.06)]">
        <SummaryCounters total={rooms.length} cleaned={cleaned} notNeeded={notNeeded} notCleaned={notCleaned} />
        <BoardTabs />
      </div>
      <div className="p-4 space-y-3">
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
