import { cn } from '@/lib/utils'
import type { CleaningStatus } from '@/types'

const statusStyles: Record<CleaningStatus, string> = {
  cleaned: 'bg-green-100 text-green-800',
  not_cleaned_yet: 'bg-amber-100 text-amber-800',
  not_needed: 'bg-gray-100 text-gray-500',
}

export function StatusBadge({ status, label }: { status: CleaningStatus; label: string }) {
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusStyles[status])}>
      {label}
    </span>
  )
}
