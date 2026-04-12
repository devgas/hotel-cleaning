/**
 * Sort rooms so that numeric part is primary key, prefix/suffix is secondary.
 * e.g. 301, B301, 302, B302, 402, B402
 */
export function sortByRoomNumber<T>(items: T[], getRoomNumber: (item: T) => string): T[] {
  return [...items].sort((a, b) => {
    const aNum = getRoomNumber(a)
    const bNum = getRoomNumber(b)
    const aDigits = parseInt(aNum.replace(/\D/g, ''), 10) || 0
    const bDigits = parseInt(bNum.replace(/\D/g, ''), 10) || 0
    if (aDigits !== bDigits) return aDigits - bDigits
    return aNum.localeCompare(bNum)
  })
}
