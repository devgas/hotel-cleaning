import type { RoomWithStatus } from '@/types'

const STORAGE_PREFIX = 'board-last-viewed'
const EVENT_NAME = 'board-unread-changed'

export interface BoardViewSnapshot {
  date: string
  signature: string
  roomSignatures: Record<number, string>
}

function getStorageKey(date: string) {
  return `${STORAGE_PREFIX}:${date}`
}

function getRoomSignature(room: RoomWithStatus) {
  return [
    room.updatedAt,
    room.status,
    room.roomType,
    room.priority ? '1' : '0',
    room.priorityTime ?? '',
    String(room.guestCount),
  ].join('::')
}

export function createBoardViewSnapshot(date: string, rooms: RoomWithStatus[] | undefined): BoardViewSnapshot {
  const safeRooms = rooms ?? []
  const roomSignatures = Object.fromEntries(
    safeRooms.map((room) => [room.dailyPlanRoomId, getRoomSignature(room)])
  )

  const signature = safeRooms
    .map((room) => `${room.dailyPlanRoomId}:${getRoomSignature(room)}`)
    .sort()
    .join('|')

  return {
    date,
    signature: signature || 'empty',
    roomSignatures,
  }
}

export function readBoardViewSnapshot(date: string): BoardViewSnapshot | null {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(getStorageKey(date))
  if (!raw) return null

  try {
    return JSON.parse(raw) as BoardViewSnapshot
  } catch {
    return null
  }
}

export function saveBoardViewSnapshot(snapshot: BoardViewSnapshot) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(getStorageKey(snapshot.date), JSON.stringify(snapshot))
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: snapshot.date }))
}

export function subscribeToBoardUnreadChanges(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined

  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key.startsWith(STORAGE_PREFIX)) {
      listener()
    }
  }
  const onCustom = () => listener()

  window.addEventListener('storage', onStorage)
  window.addEventListener(EVENT_NAME, onCustom)

  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(EVENT_NAME, onCustom)
  }
}

export function getUnreadRoomIds(current: BoardViewSnapshot, viewed: BoardViewSnapshot | null) {
  if (!viewed) return current.signature === 'empty' ? [] : Object.keys(current.roomSignatures).map(Number)

  return Object.entries(current.roomSignatures)
    .filter(([roomId, roomSignature]) => viewed.roomSignatures[Number(roomId)] !== roomSignature)
    .map(([roomId]) => Number(roomId))
}

export function hasUnreadBoardChanges(current: BoardViewSnapshot, viewed: BoardViewSnapshot | null) {
  return current.signature !== viewed?.signature
}
