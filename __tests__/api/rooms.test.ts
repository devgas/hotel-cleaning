import { describe, it, expect } from 'vitest'
import { parseRoomIdParam, validateRoomInput } from '@/lib/rooms/validateRoom'

describe('validateRoomInput', () => {
  it('rejects empty room number', () => {
    expect(validateRoomInput({ roomNumber: '' }).success).toBe(false)
  })

  it('accepts valid room number', () => {
    expect(validateRoomInput({ roomNumber: '101' }).success).toBe(true)
  })
})

describe('parseRoomIdParam', () => {
  it('accepts positive integer ids', () => {
    expect(parseRoomIdParam('42')).toBe(42)
  })

  it('rejects invalid ids before hitting Prisma', () => {
    expect(parseRoomIdParam('abc')).toBeNull()
    expect(parseRoomIdParam('1.5')).toBeNull()
    expect(parseRoomIdParam('-1')).toBeNull()
    expect(parseRoomIdParam('9007199254740992')).toBeNull()
  })
})
