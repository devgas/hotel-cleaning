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
      rooms: [{ roomId: 1, roomType: 'checkout', priority: true }]
    }).success).toBe(true)
  })
})
