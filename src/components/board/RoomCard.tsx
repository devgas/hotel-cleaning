'use client'
import { useTranslations } from 'next-intl'
import { useUpdateRoomStatusMutation } from '@/store/api/dailyPlanApi'
import { StatusBadge } from '@/components/common/StatusBadge'
import { buildWhatsAppLink } from '@/lib/whatsapp/buildLink'
import type { RoomWithStatus, CleaningStatus } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  room: RoomWithStatus
  whatsappEnabled: boolean
  whatsappPhone: string
  whatsappTemplate: string
  isOnline: boolean
}

const statusCycle: CleaningStatus[] = ['not_cleaned_yet', 'cleaned', 'not_needed']

export function RoomCard({ room, whatsappEnabled, whatsappPhone, whatsappTemplate, isOnline }: Props) {
  const t = useTranslations('board')
  const [updateStatus] = useUpdateRoomStatusMutation()

  function cycleStatus() {
    if (!isOnline) return
    const current = statusCycle.indexOf(room.status)
    const next = statusCycle[(current + 1) % statusCycle.length]
    updateStatus({ id: room.dailyPlanRoomId, status: next })
  }

  function handleWhatsApp() {
    const link = buildWhatsAppLink(whatsappPhone, whatsappTemplate, room.roomNumber)
    window.open(link, '_blank')
    updateStatus({ id: room.dailyPlanRoomId, status: 'cleaned', sendMessageUsed: true })
  }

  const statusLabels: Record<CleaningStatus, string> = {
    cleaned: t('cleaned'),
    not_cleaned_yet: t('notCleaned'),
    not_needed: t('notNeeded'),
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border p-4 flex items-center gap-3',
        room.priority && 'border-l-4 border-l-orange-400'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">{room.roomNumber}</span>
          {room.priority && (
            <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">★</span>
          )}
          <span className="text-xs text-gray-400 capitalize">{room.roomType}</span>
        </div>
        {room.updatedBy && (
          <p className="text-xs text-gray-400 mt-0.5">
            {t('updatedBy')} {room.updatedBy}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {whatsappEnabled && room.status !== 'cleaned' && (
          <button onClick={handleWhatsApp} className="text-green-600 text-lg" title="WhatsApp">
            💬
          </button>
        )}
        <button onClick={cycleStatus} disabled={!isOnline}>
          <StatusBadge status={room.status} label={statusLabels[room.status]} />
        </button>
      </div>
    </div>
  )
}
