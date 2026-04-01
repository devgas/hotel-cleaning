import { describe, it, expect } from 'vitest'
import { validateRoomInput } from '@/lib/rooms/validateRoom'

describe('validateRoomInput', () => {
  it('rejects empty room number', () => {
    expect(validateRoomInput({ roomNumber: '' }).success).toBe(false)
  })

  it('accepts valid room number', () => {
    expect(validateRoomInput({ roomNumber: '101' }).success).toBe(true)
  })
})
