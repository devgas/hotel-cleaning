'use client'
import { useTranslations } from 'next-intl'
import { CheckCircle2, CircleSlash2, ClipboardList, Clock3 } from 'lucide-react'

interface Props {
  total: number
  cleaned: number
  notNeeded: number
  notCleaned: number
}

export function SummaryCounters({ total, cleaned, notNeeded, notCleaned }: Props) {
  const t = useTranslations('board')
  const active = total - notNeeded
  const progress = active > 0 ? Math.round((cleaned / active) * 100) : 100

  return (
    <section className="border-b border-slate-200 bg-white px-3 py-2.5" aria-label={t('title')}>
      <div className="mb-2.5 grid gap-2">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
            {t('roomsTotal', { count: total })}
          </div>
          <div className="text-sm font-bold text-slate-950">
            {t('progressLabel', { progress, cleaned, active })}
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-2xl font-black leading-none text-amber-800">{notCleaned}</div>
            <Clock3 className="h-4 w-4 text-amber-700" aria-hidden="true" />
          </div>
          <div className="mt-1 text-xs font-bold text-amber-900">{t('toDo')}</div>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-2xl font-black leading-none text-emerald-700">{cleaned}</div>
            <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
          </div>
          <div className="mt-1 text-xs font-bold text-emerald-800">{t('done')}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-2xl font-black leading-none text-slate-500">{notNeeded}</div>
            <CircleSlash2 className="h-4 w-4 text-slate-500" aria-hidden="true" />
          </div>
          <div className="mt-1 text-xs font-bold text-slate-600">{t('skipped')}</div>
        </div>
      </div>
    </section>
  )
}
