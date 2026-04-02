'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/common/Header'
import { RoomSelector } from '@/components/setup/RoomSelector'
import { useGetRoomsQuery } from '@/store/api/roomsApi'
import { useCreateDailyPlanMutation } from '@/store/api/dailyPlanApi'
import type { RoomType } from '@/types'

interface SelectedRoom {
  roomId: number
  roomType: RoomType
  priority: boolean
}

export default function SetupPage() {
  const t = useTranslations('setup')
  const { locale } = useParams<{ locale: string }>()
  const router = useRouter()
  const { data: rooms = [] } = useGetRoomsQuery()
  const [createPlan, { isLoading }] = useCreateDailyPlanMutation()
  const [selected, setSelected] = useState<SelectedRoom[]>([])

  function toggle(roomId: number) {
    setSelected((prev) =>
      prev.some((r) => r.roomId === roomId)
        ? prev.filter((r) => r.roomId !== roomId)
        : [...prev, { roomId, roomType: 'stayover', priority: false }]
    )
  }

  function changeType(roomId: number, roomType: RoomType) {
    setSelected((prev) =>
      prev.map((r) =>
        r.roomId === roomId
          ? { ...r, roomType, priority: roomType === 'stayover' ? false : r.priority }
          : r
      )
    )
  }

  function changePriority(roomId: number, priority: boolean) {
    setSelected((prev) => prev.map((r) => (r.roomId === roomId ? { ...r, priority } : r)))
  }

  async function handleSave() {
    if (!selected.length) return
    await createPlan({ rooms: selected })
    router.push(`/${locale}/board`)
  }

  return (
    <div>
      <Header title={t('title')} />
      <div className="p-4 space-y-4">
        <RoomSelector
          rooms={rooms}
          selected={selected}
          onToggle={toggle}
          onTypeChange={changeType}
          onPriorityChange={changePriority}
        />
      </div>
      {selected.length > 0 && (
        <div className="fixed bottom-20 inset-x-0 px-4">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl text-base font-semibold shadow-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            {isLoading ? '...' : `${t('save')} (${selected.length})`}
          </button>
        </div>
      )}
    </div>
  )
}
