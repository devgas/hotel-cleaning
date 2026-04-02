export const priorityTimeOptions = Array.from({ length: 15 }, (_, index) => {
  const hour = `${index + 9}`.padStart(2, '0')
  return `${hour}:00`
})

export const defaultPriorityTime = priorityTimeOptions[0]

export function isValidPriorityTime(value: string | null | undefined) {
  if (!value) return false
  return priorityTimeOptions.includes(value)
}
