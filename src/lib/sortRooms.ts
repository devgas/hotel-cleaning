/**
 * Sort rooms by numeric part. Rooms with a leading letter prefix go last.
 * e.g. 301, 302, 402, B301, B302, B402
 */
export function sortByRoomNumber<T>(items: T[], getRoomNumber: (item: T) => string): T[] {
  return [...items].sort((a, b) => {
    const aNum = getRoomNumber(a)
    const bNum = getRoomNumber(b)
    const aHasPrefix = /^\D/.test(aNum)
    const bHasPrefix = /^\D/.test(bNum)
    if (aHasPrefix !== bHasPrefix) return aHasPrefix ? 1 : -1
    const aDigits = parseInt(aNum.replace(/\D/g, ''), 10) || 0
    const bDigits = parseInt(bNum.replace(/\D/g, ''), 10) || 0
    if (aDigits !== bDigits) return aDigits - bDigits
    return aNum.localeCompare(bNum)
  })
}
