import { describe, expect, it } from 'vitest'
import { getDailyWish } from '@/lib/headerDailyWish'

describe('getDailyWish', () => {
  it('returns the first Ukrainian wish on January 1 in Prague', () => {
    expect(getDailyWish('uk', new Date('2026-01-01T12:00:00Z'))).toBe('Легкого старту.')
  })

  it('wraps the list after 31 days', () => {
    expect(getDailyWish('uk', new Date('2026-02-01T12:00:00Z'))).toBe('Легкого старту.')
  })

  it('falls back to English for unsupported locales', () => {
    expect(getDailyWish('de', new Date('2026-01-02T12:00:00Z'))).toBe('Steady pace.')
  })
})
