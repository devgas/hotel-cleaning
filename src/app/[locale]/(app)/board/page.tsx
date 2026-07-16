'use client'
import Link from 'next/link'
import { useEffect, useSyncExternalStore } from 'react'
import { useSelector } from 'react-redux'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { AlertCircle, ClipboardList, Sparkles } from 'lucide-react'
import { Header } from '@/components/common/Header'
import { SummaryCounters } from '@/components/board/SummaryCounters'
import { BoardTabs } from '@/components/board/BoardTabs'
import { RoomCard } from '@/components/board/RoomCard'
import { useGetPlanByDateQuery } from '@/store/api/dailyPlanApi'
import { useGetSettingsQuery } from '@/store/api/settingsApi'
import { filterBoardRooms, getBoardViewMetrics } from '@/lib/boardView'
import {
  createBoardViewSnapshot,
  getUnreadRoomIds,
  hasUnreadBoardChanges,
  readBoardViewSnapshot,
  saveBoardViewSnapshot,
  subscribeToBoardUnreadChanges,
} from '@/lib/boardUnread'
import type { RootState } from '@/store'

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

export default function BoardPage() {
  const t = useTranslations('board')
  const tCommon = useTranslations('common')
  const tSetup = useTranslations('setup')
  const { locale } = useParams<{ locale: string }>()
  const activeTab = useSelector((s: RootState) => s.ui.boardTab)
  const isOnline = useSelector((s: RootState) => s.ui.isOnline)

  const todayDate = useSyncExternalStore(() => () => undefined, getClientDate, () => '')

  const { data: plan, isLoading } = useGetPlanByDateQuery(todayDate, {
    skip: !todayDate,
    pollingInterval: POLL_INTERVAL,
  })
  const { data: settings } = useGetSettingsQuery()

  useSyncExternalStore(
    subscribeToBoardUnreadChanges,
    () => readBoardViewSnapshot(todayDate)?.signature ?? '',
    () => ''
  )

  const rooms = plan?.rooms ?? []
  const currentSnapshot = createBoardViewSnapshot(todayDate, plan?.rooms)
  const viewedSnapshot = readBoardViewSnapshot(todayDate)
  const unreadRoomIds = getUnreadRoomIds(currentSnapshot, viewedSnapshot)
  const hasBoardUnread = unreadRoomIds.length > 0

  useEffect(() => {
    if (!todayDate) return
    if (hasUnreadBoardChanges(currentSnapshot, viewedSnapshot)) {
      saveBoardViewSnapshot(currentSnapshot)
    }
  }, [todayDate, currentSnapshot, viewedSnapshot])

  if (isLoading) {
    return (
      <div>
        <Header title={t('title')} />
        <div className="space-y-3 bg-slate-50 px-3 py-4" aria-label={tCommon('loading')} aria-busy="true">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-500">
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              {t('loadingBoard')}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          </div>
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-xl border bg-white shadow-sm" />
          ))}
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div>
        <Header title={t('title')} />
        <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center gap-4 p-4 text-center">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm">
            <ClipboardList className="mx-auto mb-3 h-9 w-9 text-slate-400" aria-hidden="true" />
            <p className="text-lg font-semibold text-slate-900">{t('noPlan')}</p>
            <p className="mt-2 text-sm text-slate-500">{t('noPlanHint')}</p>
          </div>
          <Link
            href={`/${locale}/setup`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('goToSetup')}
          </Link>
        </div>
      </div>
    )
  }

  const { cleaned, notNeeded, notCleaned, tabCounts } = getBoardViewMetrics(rooms)
  const filtered = filterBoardRooms(rooms, activeTab)

  return (
    <div>
      <Header title={t('title')} />
      <div className="sticky top-[52px] z-30 bg-white shadow-[0_2px_8px_0_rgba(15,23,42,0.08)]">
        {hasBoardUnread && (
          <div className="flex items-center justify-between gap-3 border-b border-red-100 bg-red-50 px-4 py-2 text-xs font-bold text-red-700">
            <span className="inline-flex items-center gap-2">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              {t('newUpdates')}
            </span>
            <span>{t('roomsCount', { count: unreadRoomIds.length })}</span>
          </div>
        )}
        <SummaryCounters total={rooms.length} cleaned={cleaned} notNeeded={notNeeded} notCleaned={notCleaned} />
        <BoardTabs counts={tabCounts} />
      </div>
      <div className="space-y-2 bg-slate-50 px-3 pb-4 pt-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm font-semibold text-slate-500">
            <Sparkles className="mx-auto mb-2 h-6 w-6 text-slate-400" aria-hidden="true" />
            {activeTab === 'all' ? tSetup('noRooms') : t('emptyTab')}
          </div>
        ) : (
          filtered.map((room) => (
            <RoomCard
              key={room.dailyPlanRoomId}
              room={room}
              hasUnreadChange={unreadRoomIds.includes(room.dailyPlanRoomId)}
              whatsappEnabled={settings?.whatsappEnabled ?? false}
              whatsappChatLink={settings?.whatsappChatLink ?? ''}
              whatsappPhone={settings?.whatsappPhone ?? ''}
              whatsappTemplate={settings?.whatsappMessageTemplate ?? ''}
              whatsappAllowAfterCleaned={settings?.whatsappAllowAfterCleaned ?? false}
              isOnline={isOnline}
            />
          ))
        )}
      </div>
    </div>
  )
}
