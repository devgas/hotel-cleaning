const MS_PER_DAY = 24 * 60 * 60 * 1000

function toUtcDay(value: string): number | null {
  const [datePart] = value.split('T')
  const parts = datePart.split('-').map(Number)
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null

  const [year, month, day] = parts
  return Date.UTC(year, month - 1, day)
}

export function isBeforePlanDate(planDate: string, cleanedDate: string): boolean {
  const planDay = toUtcDay(planDate)
  const cleanedDay = toUtcDay(cleanedDate)
  if (planDay === null || cleanedDay === null) return false

  return cleanedDay < planDay
}

export function getDaysSincePreviousCheckout(planDate: string, lastCheckoutDate: string | null): number | null {
  return getDaysSinceCleaned(planDate, lastCheckoutDate)
}

export function getDaysSinceCleaned(planDate: string, lastCleanedDate: string | null): number | null {
  if (!lastCleanedDate) return null

  const planDay = toUtcDay(planDate)
  const cleanedDay = toUtcDay(lastCleanedDate)
  if (planDay === null || cleanedDay === null) return null

  return Math.max(0, Math.round((planDay - cleanedDay) / MS_PER_DAY))
}

export function getDaysSinceCleanedLabel(days: number): string {
  return `${days}д`
}
