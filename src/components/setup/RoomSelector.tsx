'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
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
}

interface Props {
  rooms: Room[]
  selected: SelectedRoom[]
  onToggle: (roomId: number) => void
  onTypeChange: (roomId: number, type: RoomType) => void
  onPriorityChange: (roomId: number, priority: boolean) => void
}

export function RoomSelector({ rooms, selected, onToggle, onTypeChange, onPriorityChange }: Props) {
  const t = useTranslations('setup')
  const [search, setSearch] = useState('')

  const isSelected = (id: number) => selected.some((s) => s.roomId === id)
  const getSelected = (id: number) => selected.find((s) => s.roomId === id)

  const filtered = rooms.filter((r) =>
    r.roomNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder={t('search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="space-y-2">
        {filtered.map((room) => {
          const sel = getSelected(room.id)
          return (
            <div
              key={room.id}
              className={cn(
                'rounded-xl border p-3 transition-colors',
                sel ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
              )}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggle(room.id)}
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    sel ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  )}
                >
                  {sel && <span className="text-white text-xs">✓</span>}
                </button>
                <span className="font-medium text-gray-900">{room.roomNumber}</span>
                {sel && (
                  <div className="ml-auto flex items-center gap-2">
                    <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
                      {(['checkout', 'stayover'] as RoomType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => onTypeChange(room.id, type)}
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
                      <button
                        onClick={() => onPriorityChange(room.id, !sel.priority)}
                        className={cn(
                          'text-xs px-2 py-1 rounded-lg border',
                          sel.priority ? 'bg-orange-100 border-orange-300 text-orange-700' : 'border-gray-200 text-gray-400'
                        )}
                      >
                        ★ {t('priority')}
                      </button>
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
