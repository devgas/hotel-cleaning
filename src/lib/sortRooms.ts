/**
 * Sort rooms so that numeric part is primary key, "В" rooms go last.
 * e.g. 301, 302, 402, B301, B302, B402
 */
export function sortByRoomNumber<T>(items: T[], getRoomNumber: (item: T) => string): T[] {
  return [...items].sort((a, b) => {
    const aNum = getRoomNumber(a)
    const bNum = getRoomNumber(b)
    const aIsB = /[ВвBb]/.test(aNum.replace(/\d/g, ''))
    const bIsB = /[ВвBb]/.test(bNum.replace(/\d/g, ''))
    if (aIsB !== bIsB) return aIsB ? 1 : -1
    const aDigits = parseInt(aNum.replace(/\D/g, ''), 10) || 0
    const bDigits = parseInt(bNum.replace(/\D/g, ''), 10) || 0
    if (aDigits !== bDigits) return aDigits - bDigits
    return aNum.localeCompare(bNum)
  })
}
