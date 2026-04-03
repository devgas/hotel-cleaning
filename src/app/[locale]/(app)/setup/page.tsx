'use client'
import { useMemo, useState, useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/common/Header'
import { RoomSelector } from '@/components/setup/RoomSelector'
import { defaultPriorityTime } from '@/lib/dailyPlans/priorityTime'
import { cn } from '@/lib/utils'
import { useGetRoomsQuery } from '@/store/api/roomsApi'
import { useCreateDailyPlanMutation, useGetPlanByDateQuery } from '@/store/api/dailyPlanApi'
import type { RoomType } from '@/types'

interface SelectedRoom {
  roomId: number
  roomType: RoomType
  priority: boolean
  priorityTime?: string | null
  guestCount: number
}

type PlanTab = 'today' | 'tomorrow'

function formatPlanDate(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const emptyPlanDates = { today: '', tomorrow: '' }
let cachedPlanDates = emptyPlanDates

function subscribeToPlanDates() {
  return () => undefined
}

function getClientPlanDates() {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const nextPlanDates = {
    today: formatPlanDate(today),
    tomorrow: formatPlanDate(tomorrow),
  }

  if (
    cachedPlanDates.today === nextPlanDates.today &&
    cachedPlanDates.tomorrow === nextPlanDates.tomorrow
  ) {
    return cachedPlanDates
  }

  cachedPlanDates = nextPlanDates
  return cachedPlanDates
}

export default function SetupPage() {
  const t = useTranslations('setup')
  const { locale } = useParams<{ locale: string }>()
  const router = useRouter()
  const { data: rooms = [] } = useGetRoomsQuery()
  const [activeTab, setActiveTab] = useState<PlanTab>('today')
  const [createPlan, { isLoading }] = useCreateDailyPlanMutation()
  const [savedTab, setSavedTab] = useState<PlanTab | null>(null)
  const [search, setSearch] = useState('')
  const [selectedOverrides, setSelectedOverrides] = useState<Partial<Record<PlanTab, SelectedRoom[]>>>({})
  const planDates = useSyncExternalStore(
    subscribeToPlanDates,
    getClientPlanDates,
    () => emptyPlanDates
  )

  const { data: todayPlan } = useGetPlanByDateQuery(planDates.today, { skip: !planDates.today })
  const { data: tomorrowPlan } = useGetPlanByDateQuery(planDates.tomorrow, {
    skip: !planDates.tomorrow,
  })

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    [locale]
  )

  const selectedByTab = useMemo(
    () => ({
      today:
        todayPlan?.rooms.map((room) => ({
          roomId: room.roomId,
          roomType: room.roomType,
          priority: room.priority,
          priorityTime: room.priorityTime ?? null,
          guestCount: room.guestCount,
        })) ?? [],
      tomorrow:
        tomorrowPlan?.rooms.map((room) => ({
          roomId: room.roomId,
          roomType: room.roomType,
          priority: room.priority,
          priorityTime: room.priorityTime ?? null,
          guestCount: room.guestCount,
        })) ?? [],
    }),
    [todayPlan, tomorrowPlan]
  )

  const selected = selectedOverrides[activeTab] ?? selectedByTab[activeTab]

  const activeDateStr = activeTab === 'today' ? planDates.today : planDates.tomorrow
  const activePlanLabel = activeTab === 'today' ? t('today') : t('tomorrow')

  function formatTabDate(dateStr: string) {
    if (!dateStr) return '...'

    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return dateFormatter.format(date)
  }

  function updateSelected(updater: (current: SelectedRoom[]) => SelectedRoom[]) {
    setSelectedOverrides((current) => ({
      ...current,
      [activeTab]: updater(current[activeTab] ?? selectedByTab[activeTab]),
    }))
  }

  function getInitialSelected(plan: typeof todayPlan) {
    return (
      plan?.rooms.map((room) => ({
        roomId: room.roomId,
        roomType: room.roomType,
        priority: room.priority,
        priorityTime: room.priorityTime ?? null,
        guestCount: room.guestCount,
      })) ?? []
    )
  }

  function toggle(roomId: number) {
    updateSelected((prev) =>
      prev.some((r) => r.roomId === roomId)
        ? prev.filter((r) => r.roomId !== roomId)
        : [...prev, { roomId, roomType: 'stayover', priority: false, priorityTime: null, guestCount: 1 }]
    )
  }

  function changeType(roomId: number, roomType: RoomType) {
    updateSelected((prev) =>
      prev.map((r) =>
        r.roomId === roomId
          ? {
              ...r,
              roomType,
              priority: roomType === 'stayover' ? false : r.priority,
              priorityTime:
                roomType === 'stayover'
                  ? null
                  : r.priority
                    ? (r.priorityTime ?? defaultPriorityTime)
                    : r.priorityTime,
            }
          : r
      )
    )
  }

  function changePriority(roomId: number, priority: boolean) {
    updateSelected((prev) =>
      prev.map((r) =>
        r.roomId === roomId
          ? { ...r, priority, priorityTime: priority ? (r.priorityTime ?? defaultPriorityTime) : null }
          : r
      )
    )
  }

  function changePriorityTime(roomId: number, priorityTime: string) {
    updateSelected((prev) =>
      prev.map((r) => (r.roomId === roomId ? { ...r, priorityTime } : r))
    )
  }

  function changeGuestCount(roomId: number, guestCount: number) {
    updateSelected((prev) =>
      prev.map((r) => (r.roomId === roomId ? { ...r, guestCount } : r))
    )
  }

  async function handleSave() {
    if (!selected.length) return
    const confirmed = window.confirm(
      t('confirmOverride', {
        date: formatTabDate(activeDateStr),
      })
    )
    if (!confirmed) return
    await createPlan({ date: activeDateStr, rooms: selected })
    setSelectedOverrides((current) => {
      const next = { ...current }
      delete next[activeTab]
      return next
    })
    if (activeTab === 'today') {
      router.push(`/${locale}/board`)
    } else {
      setSavedTab(activeTab)
      window.setTimeout(() => setSavedTab(null), 2500)
    }
  }

  return (
    <div>
      <Header title={t('title')} />
      <div className="sticky top-[52px] z-30 bg-white px-4 pt-3 pb-3 shadow-[0_2px_8px_0_rgba(0,0,0,0.06)]">
        <div className="grid h-auto w-full grid-cols-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => { setActiveTab('today'); setSearch('') }}
            className={cn(
              'h-auto rounded-lg px-3 py-2 text-center',
              activeTab === 'today' ? 'bg-blue-600 text-white' : 'text-slate-600'
            )}
          >
            <div className="text-xs font-semibold uppercase tracking-wide">{t('today')}</div>
            <div className="text-[11px] opacity-80">{formatTabDate(planDates.today)}</div>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('tomorrow'); setSearch('') }}
            className={cn(
              'h-auto rounded-lg px-3 py-2 text-center',
              activeTab === 'tomorrow' ? 'bg-emerald-600 text-white' : 'text-slate-600'
            )}
          >
            <div className="text-xs font-semibold uppercase tracking-wide">{t('tomorrow')}</div>
            <div className="text-[11px] opacity-80">{formatTabDate(planDates.tomorrow)}</div>
          </button>
        </div>
        <input
          type="text"
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className={cn('px-4 pt-4 space-y-4', selected.length > 0 && 'pb-36')}>
        {activeTab === 'today' && (
          <div>
            <RoomSelector
              rooms={rooms}
              selected={selectedOverrides.today ?? getInitialSelected(todayPlan)}
              onToggle={toggle}
              onTypeChange={changeType}
              onPriorityChange={changePriority}
              onPriorityTimeChange={changePriorityTime}
              onGuestCountChange={changeGuestCount}
              search={search}
              onSearchChange={setSearch}
            />
          </div>
        )}
        {activeTab === 'tomorrow' && (
          <div>
            <RoomSelector
              rooms={rooms}
              selected={selectedOverrides.tomorrow ?? getInitialSelected(tomorrowPlan)}
              onToggle={toggle}
              onTypeChange={changeType}
              onPriorityChange={changePriority}
              onPriorityTimeChange={changePriorityTime}
              onGuestCountChange={changeGuestCount}
              search={search}
              onSearchChange={setSearch}
            />
          </div>
        )}
      </div>
      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-4 pt-3 pb-20 bg-white shadow-[0_-4px_12px_0_rgba(0,0,0,0.06)]">
          <button
            onClick={handleSave}
            disabled={isLoading || !selectedOverrides[activeTab]}
            className={cn(
              'w-full py-4 rounded-2xl text-base font-semibold text-white shadow-lg transition-all',
              !selectedOverrides[activeTab] ? 'opacity-40 cursor-default' : 'active:scale-95',
              activeTab === 'today' ? 'bg-blue-600' : 'bg-emerald-600'
            )}
          >
            {isLoading ? '...' : savedTab === activeTab ? `${t('saved')} ${activePlanLabel}` : (
              <span className="flex flex-col items-center gap-0.5">
                <span>{t('save')} {activePlanLabel} ({selected.length})</span>
                <span className="text-xs font-normal opacity-80">
                  {t('checkout')} {selected.filter(r => r.roomType === 'checkout').length} · {t('stayover')} {selected.filter(r => r.roomType === 'stayover').length}
                </span>
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
