import { describe, it, expect } from 'vitest'
import { validateDailyPlanInput } from '@/lib/dailyPlans/validateDailyPlan'

describe('validateDailyPlanInput', () => {
  it('rejects empty rooms array', () => {
    expect(validateDailyPlanInput({ rooms: [] }).success).toBe(false)
  })
  it('rejects invalid roomType', () => {
    expect(validateDailyPlanInput({
      rooms: [{ roomId: 1, roomType: 'invalid', priority: false }]
    }).success).toBe(false)
  })
  it('accepts valid input', () => {
    expect(validateDailyPlanInput({
      rooms: [{ roomId: 1, roomType: 'checkout', priority: true, priorityTime: '09:00' }]
    }).success).toBe(true)
  })
  it('accepts big stayover input', () => {
    expect(validateDailyPlanInput({
      rooms: [{ roomId: 1, roomType: 'big-stayover', priority: false }]
    }).success).toBe(true)
  })
  it('accepts valid input with explicit date', () => {
    expect(validateDailyPlanInput({
      date: '2026-04-02',
      rooms: [{ roomId: 1, roomType: 'checkout', priority: true, priorityTime: '10:00' }]
    }).success).toBe(true)
  })
  it('rejects invalid date format', () => {
    expect(validateDailyPlanInput({
      date: '02-04-2026',
      rooms: [{ roomId: 1, roomType: 'checkout', priority: true, priorityTime: '11:00' }]
    }).success).toBe(false)
  })
  it('rejects missing priority time when priority is enabled', () => {
    expect(validateDailyPlanInput({
      rooms: [{ roomId: 1, roomType: 'checkout', priority: true, priorityTime: null }]
    }).success).toBe(false)
  })
  it('rejects out of range priority time', () => {
    expect(validateDailyPlanInput({
      rooms: [{ roomId: 1, roomType: 'checkout', priority: true, priorityTime: '08:00' }]
    }).success).toBe(false)
  })
})
