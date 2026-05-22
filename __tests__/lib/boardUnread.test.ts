import { describe, expect, it } from 'vitest'
import { createBoardViewSnapshot, getUnreadRoomIds, hasUnreadBoardChanges } from '@/lib/boardUnread'
import type { RoomWithStatus } from '@/types'

function makeRoom(overrides: Partial<RoomWithStatus>): RoomWithStatus {
  return {
    id: overrides.id ?? 1,
    roomId: overrides.roomId ?? 1,
    roomNumber: overrides.roomNumber ?? '101',
    roomType: overrides.roomType ?? 'checkout',
    priority: overrides.priority ?? false,
    priorityTime: overrides.priorityTime ?? null,
    guestCount: overrides.guestCount ?? 1,
    status: overrides.status ?? 'not_cleaned_yet',
    updatedBy: overrides.updatedBy ?? null,
    updatedAt: overrides.updatedAt ?? '2026-05-22T10:00:00.000Z',
    dailyPlanRoomId: overrides.dailyPlanRoomId ?? 1,
  }
}

describe('boardUnread', () => {
  it('marks new and changed rooms as unread', () => {
    const viewed = createBoardViewSnapshot('2026-05-22', [
      makeRoom({ dailyPlanRoomId: 1, updatedAt: '2026-05-22T09:00:00.000Z' }),
      makeRoom({ dailyPlanRoomId: 2, roomId: 2, roomNumber: '102', updatedAt: '2026-05-22T09:00:00.000Z' }),
    ])

    const current = createBoardViewSnapshot('2026-05-22', [
      makeRoom({ dailyPlanRoomId: 1, updatedAt: '2026-05-22T10:00:00.000Z' }),
      makeRoom({ dailyPlanRoomId: 3, roomId: 3, roomNumber: '103', updatedAt: '2026-05-22T10:05:00.000Z' }),
    ])

    expect(getUnreadRoomIds(current, viewed)).toEqual([1, 3])
  })

  it('marks a room unread when only status changes', () => {
    const viewed = createBoardViewSnapshot('2026-05-22', [
      makeRoom({ dailyPlanRoomId: 1, status: 'not_cleaned_yet', updatedAt: '2026-05-22T10:00:00.000Z' }),
    ])

    const current = createBoardViewSnapshot('2026-05-22', [
      makeRoom({ dailyPlanRoomId: 1, status: 'cleaned', updatedAt: '2026-05-22T10:00:00.000Z' }),
    ])

    expect(hasUnreadBoardChanges(current, viewed)).toBe(true)
    expect(getUnreadRoomIds(current, viewed)).toEqual([1])
  })

  it('flags board changes when a room disappears', () => {
    const viewed = createBoardViewSnapshot('2026-05-22', [
      makeRoom({ dailyPlanRoomId: 1 }),
      makeRoom({ dailyPlanRoomId: 2, roomId: 2, roomNumber: '102' }),
    ])
    const current = createBoardViewSnapshot('2026-05-22', [
      makeRoom({ dailyPlanRoomId: 1 }),
    ])

    expect(hasUnreadBoardChanges(current, viewed)).toBe(true)
    expect(getUnreadRoomIds(current, viewed)).toEqual([])
  })
})
