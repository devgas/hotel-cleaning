import { describe, expect, it } from 'vitest'
import { filterBoardRooms, getBoardViewMetrics } from '@/lib/boardView'
import type { RoomWithStatus } from '@/types'

function room(overrides: Partial<RoomWithStatus>): RoomWithStatus {
  return {
    id: overrides.id ?? 1,
    dailyPlanRoomId: overrides.dailyPlanRoomId ?? 1,
    roomId: overrides.roomId ?? 1,
    roomNumber: overrides.roomNumber ?? '101',
    roomType: overrides.roomType ?? 'checkout',
    status: overrides.status ?? 'not_cleaned_yet',
    priority: overrides.priority ?? false,
    priorityTime: overrides.priorityTime ?? null,
    guestCount: overrides.guestCount ?? 1,
    updatedAt: overrides.updatedAt ?? '2026-07-16T08:00:00.000Z',
    updatedBy: overrides.updatedBy ?? null,
    daysSinceLastCheckout: overrides.daysSinceLastCheckout ?? null,
  }
}

describe('boardView', () => {
  const rooms = [
    room({ dailyPlanRoomId: 1, roomType: 'checkout', status: 'cleaned', priority: true }),
    room({ dailyPlanRoomId: 2, roomType: 'stayover', status: 'not_cleaned_yet' }),
    room({ dailyPlanRoomId: 3, roomType: 'big-stayover', status: 'not_needed' }),
  ]

  it('derives summary and tab counts in one pass', () => {
    expect(getBoardViewMetrics(rooms)).toEqual({
      cleaned: 1,
      notNeeded: 1,
      notCleaned: 1,
      tabCounts: {
        all: { total: 3, cleaned: 1, notCleaned: 1 },
        priority: { total: 1, cleaned: 1, notCleaned: 0 },
        checkout: { total: 1, cleaned: 1, notCleaned: 0 },
        stayover: { total: 2, cleaned: 0, notCleaned: 1 },
      },
    })
  })

  it('filters the active board tab including priority rooms', () => {
    expect(filterBoardRooms(rooms, 'all')).toHaveLength(3)
    expect(filterBoardRooms(rooms, 'priority').map((item) => item.dailyPlanRoomId)).toEqual([1])
    expect(filterBoardRooms(rooms, 'checkout').map((item) => item.dailyPlanRoomId)).toEqual([1])
    expect(filterBoardRooms(rooms, 'stayover').map((item) => item.dailyPlanRoomId)).toEqual([2, 3])
  })
})
