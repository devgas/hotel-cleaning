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
        })) ?? [],
      tomorrow:
        tomorrowPlan?.rooms.map((room) => ({
          roomId: room.roomId,
          roomType: room.roomType,
          priority: room.priority,
          priorityTime: room.priorityTime ?? null,
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
      })) ?? []
    )
  }

  function toggle(roomId: number) {
    updateSelected((prev) =>
      prev.some((r) => r.roomId === roomId)
        ? prev.filter((r) => r.roomId !== roomId)
        : [...prev, { roomId, roomType: 'stayover', priority: false, priorityTime: null }]
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

  async function handleSave() {
    if (!selected.length) return
    const confirmed = window.confirm(
      t('confirmOverride', {
        date: formatTabDate(activeDateStr),
      })
    )
    if (!confirmed) return
    await createPlan({ date: activeDateStr, rooms: selected })
    if (activeTab === 'today') {
      router.push(`/${locale}/board`)
    }
  }

  return (
    <div>
      <Header title={t('title')} />
      <div className={cn('p-4 space-y-4', selected.length > 0 && 'pb-32')}>
        <div className="sticky top-[57px] z-30 bg-white pb-3">
          <div className="grid h-auto w-full grid-cols-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className={cn(
                'h-auto rounded-lg px-3 py-2 text-left',
                activeTab === 'today' ? 'bg-blue-600 text-white' : 'text-slate-600'
              )}
            >
              <div className="text-left">
                <div className="text-xs font-semibold uppercase tracking-wide">{t('today')}</div>
                <div className="text-[11px] opacity-80">{formatTabDate(planDates.today)}</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tomorrow')}
              className={cn(
                'h-auto rounded-lg px-3 py-2 text-left',
                activeTab === 'tomorrow' ? 'bg-emerald-600 text-white' : 'text-slate-600'
              )}
            >
              <div className="text-left">
                <div className="text-xs font-semibold uppercase tracking-wide">{t('tomorrow')}</div>
                <div className="text-[11px] opacity-80">{formatTabDate(planDates.tomorrow)}</div>
              </div>
            </button>
          </div>
        </div>
        {activeTab === 'today' && (
          <div>
            <RoomSelector
              rooms={rooms}
              selected={selectedOverrides.today ?? getInitialSelected(todayPlan)}
              onToggle={toggle}
              onTypeChange={changeType}
              onPriorityChange={changePriority}
              onPriorityTimeChange={changePriorityTime}
              searchClassName="sticky top-[117px] z-20 -mt-1 pb-3 pt-1"
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
              searchClassName="sticky top-[117px] z-20 -mt-1 pb-3 pt-1"
            />
          </div>
        )}
      </div>
      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-20 z-40 bg-gradient-to-t from-white via-white px-4 pt-3">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={cn(
              'w-full py-4 rounded-2xl text-base font-semibold text-white shadow-lg active:scale-95 transition-transform disabled:opacity-50',
              activeTab === 'today' ? 'bg-blue-600' : 'bg-emerald-600'
            )}
          >
            {isLoading ? '...' : `${t('save')} ${activePlanLabel} (${selected.length})`}
          </button>
        </div>
      )}
    </div>
  )
}
