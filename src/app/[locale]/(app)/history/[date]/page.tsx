'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Header } from '@/components/common/Header'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { RoomWithStatus } from '@/types'

export default function HistoryDetailPage() {
  const t = useTranslations('history')
  const { date } = useParams<{ date: string }>()
  const [rooms, setRooms] = useState<RoomWithStatus[]>([])

  useEffect(() => {
    fetch(`/api/daily-plans/${date}`)
      .then((r) => r.json())
      .then((data) => setRooms(data?.rooms ?? []))
  }, [date])

  const cleaned = rooms.filter((r) => r.status === 'cleaned').length
  const notNeeded = rooms.filter((r) => r.status === 'not_needed').length

  return (
    <div>
      <Header title={date ?? ''} />
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 bg-white rounded-xl border p-3">
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{cleaned}</div>
            <div className="text-xs text-gray-400">{t('cleaned')}</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-400">{notNeeded}</div>
            <div className="text-xs text-gray-400">{t('notNeeded')}</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-700">{rooms.length}</div>
            <div className="text-xs text-gray-400">{t('total')}</div>
          </div>
        </div>
        {rooms.map((room) => (
          <div key={room.dailyPlanRoomId} className="bg-white rounded-xl border p-3 flex items-center justify-between">
            <span className="font-medium">{room.roomNumber}</span>
            <StatusBadge status={room.status} label={
              room.status === 'cleaned' ? t('cleaned') :
              room.status === 'not_needed' ? t('notNeeded') :
              t('notCleaned')
            } />
          </div>
        ))}
      </div>
    </div>
  )
}
