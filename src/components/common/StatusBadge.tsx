import { cn } from '@/lib/utils'
import type { CleaningStatus } from '@/types'
import { CheckCircle2, Clock3, MinusCircle } from 'lucide-react'

const statusStyles: Record<CleaningStatus, string> = {
  cleaned: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  not_cleaned_yet: 'border-amber-200 bg-amber-50 text-amber-900',
  not_needed: 'border-slate-200 bg-slate-50 text-slate-500',
}

export function StatusBadge({ status, label }: { status: CleaningStatus; label: string }) {
  const Icon = status === 'cleaned' ? CheckCircle2 : status === 'not_needed' ? MinusCircle : Clock3

  return (
    <span
      className={cn(
        'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold leading-tight',
        statusStyles[status]
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  )
}
