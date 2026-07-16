import { isStayoverRoomType } from '@/lib/roomTypes'
import type { RoomWithStatus } from '@/types'

export type BoardTab = 'all' | 'priority' | 'checkout' | 'stayover'

export interface BoardTabStats {
  total: number
  cleaned: number
  notCleaned: number
}

export interface BoardViewMetrics {
  cleaned: number
  notNeeded: number
  notCleaned: number
  tabCounts: Record<BoardTab, BoardTabStats>
}

function emptyStats(): BoardTabStats {
  return { total: 0, cleaned: 0, notCleaned: 0 }
}

function countRoom(stats: BoardTabStats, room: RoomWithStatus) {
  stats.total += 1
  if (room.status === 'cleaned') stats.cleaned += 1
  if (room.status === 'not_cleaned_yet') stats.notCleaned += 1
}

export function getBoardViewMetrics(rooms: RoomWithStatus[]): BoardViewMetrics {
  const tabCounts = {
    all: emptyStats(),
    priority: emptyStats(),
    checkout: emptyStats(),
    stayover: emptyStats(),
  }
  let cleaned = 0
  let notNeeded = 0
  let notCleaned = 0

  for (const room of rooms) {
    if (room.status === 'cleaned') cleaned += 1
    if (room.status === 'not_needed') notNeeded += 1
    if (room.status === 'not_cleaned_yet') notCleaned += 1

    countRoom(tabCounts.all, room)
    if (room.priority) countRoom(tabCounts.priority, room)
    if (room.roomType === 'checkout') countRoom(tabCounts.checkout, room)
    if (isStayoverRoomType(room.roomType)) countRoom(tabCounts.stayover, room)
  }

  return { cleaned, notNeeded, notCleaned, tabCounts }
}

export function filterBoardRooms(rooms: RoomWithStatus[], activeTab: BoardTab): RoomWithStatus[] {
  if (activeTab === 'priority') return rooms.filter((room) => room.priority)
  if (activeTab === 'checkout') return rooms.filter((room) => room.roomType === 'checkout')
  if (activeTab === 'stayover') return rooms.filter((room) => isStayoverRoomType(room.roomType))

  return rooms
}
