import { describe, expect, it } from 'vitest'
import { getDaysSinceCleaned, getDaysSinceCleanedLabel, isBeforePlanDate } from '@/lib/cleaningRecency'

describe('cleaningRecency', () => {
  it('returns calendar days between the plan date and last cleaned date', () => {
    expect(getDaysSinceCleaned('2026-06-06', '2026-06-06')).toBe(0)
    expect(getDaysSinceCleaned('2026-06-06', '2026-06-05')).toBe(1)
    expect(getDaysSinceCleaned('2026-06-06', '2026-06-04')).toBe(2)
  })

  it('returns null when the room has no cleaned date', () => {
    expect(getDaysSinceCleaned('2026-06-06', null)).toBeNull()
  })

  it('treats only previous dates as prior cleanings', () => {
    expect(isBeforePlanDate('2026-06-06', '2026-06-05')).toBe(true)
    expect(isBeforePlanDate('2026-06-06', '2026-06-06')).toBe(false)
    expect(isBeforePlanDate('2026-06-06', '2026-06-07')).toBe(false)
  })

  it('formats the compact Ukrainian day label', () => {
    expect(getDaysSinceCleanedLabel(0)).toBe('0д')
    expect(getDaysSinceCleanedLabel(2)).toBe('2д')
  })
})
