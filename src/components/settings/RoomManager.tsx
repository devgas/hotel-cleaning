'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGetRoomsQuery, useCreateRoomMutation, useDeleteRoomMutation } from '@/store/api/roomsApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function RoomManager() {
  const t = useTranslations('settings')
  const { data: rooms = [] } = useGetRoomsQuery()
  const [createRoom] = useCreateRoomMutation()
  const [deleteRoom] = useDeleteRoomMutation()
  const [newNumber, setNewNumber] = useState('')

  async function handleAdd() {
    if (!newNumber.trim()) return
    await createRoom({ roomNumber: newNumber.trim() })
    setNewNumber('')
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700">{t('rooms')}</h3>
      <div className="flex gap-2">
        <Input
          placeholder={t('roomNumber')}
          value={newNumber}
          onChange={(e) => setNewNumber(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd}>{t('addRoom')}</Button>
      </div>
      <div className="space-y-2">
        {rooms.map((room) => (
          <div key={room.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
            <span className="font-medium">{room.roomNumber}</span>
            <button onClick={() => deleteRoom(room.id)} className="text-red-500 text-sm">
              {t('deleteRoom')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
