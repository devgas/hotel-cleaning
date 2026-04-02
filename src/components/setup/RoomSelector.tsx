'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { defaultPriorityTime, priorityTimeOptions } from '@/lib/dailyPlans/priorityTime'
import { cn } from '@/lib/utils'
import type { RoomType } from '@/types'

interface Room {
  id: number
  roomNumber: string
}

interface SelectedRoom {
  roomId: number
  roomType: RoomType
  priority: boolean
  priorityTime?: string | null
}

interface Props {
  rooms: Room[]
  selected: SelectedRoom[]
  onToggle: (roomId: number) => void
  onTypeChange: (roomId: number, type: RoomType) => void
  onPriorityChange: (roomId: number, priority: boolean) => void
  onPriorityTimeChange: (roomId: number, priorityTime: string) => void
  searchClassName?: string
}

export function RoomSelector({
  rooms,
  selected,
  onToggle,
  onTypeChange,
  onPriorityChange,
  onPriorityTimeChange,
  searchClassName,
}: Props) {
  const t = useTranslations('setup')
  const [search, setSearch] = useState('')

  const getSelected = (id: number) => selected.find((s) => s.roomId === id)

  const filtered = rooms.filter((r) =>
    r.roomNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-3">
      <div className={cn('border-b border-gray-200 bg-white', searchClassName)}>
        <input
          type="text"
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        {filtered.map((room) => {
          const sel = getSelected(room.id)
          return (
            <div
              key={room.id}
              onClick={() => onToggle(room.id)}
              className={cn(
                'rounded-xl border p-3 transition-colors cursor-pointer active:opacity-80',
                sel ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
              )}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggle(room.id) }}
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    sel ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  )}
                >
                  {sel && <span className="text-white text-xs">✓</span>}
                </button>
                <span className="font-medium text-gray-900">{room.roomNumber}</span>
                {sel && (
                  <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                    <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
                      {(['checkout', 'stayover'] as RoomType[]).map((type) => (
                        <button
                          key={type}
                          onClick={(e) => { e.stopPropagation(); onTypeChange(room.id, type) }}
                          className={cn(
                            'px-2 py-1',
                            sel.roomType === type ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
                          )}
                        >
                          {t(type)}
                        </button>
                      ))}
                    </div>
                    {sel.roomType === 'checkout' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onPriorityChange(room.id, !sel.priority)
                          }}
                          className={cn(
                            'text-xs px-2 py-1 rounded-lg border',
                            sel.priority
                              ? 'bg-orange-100 border-orange-300 text-orange-700'
                              : 'border-gray-200 text-gray-400'
                          )}
                        >
                          ★ {t('priority')}
                        </button>
                        {sel.priority && (
                          <select
                            value={sel.priorityTime ?? defaultPriorityTime}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onPriorityTimeChange(room.id, e.target.value)}
                            className="rounded-lg border border-orange-200 bg-white px-2 py-1 text-xs text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                          >
                            {priorityTimeOptions.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
