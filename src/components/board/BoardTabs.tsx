'use client'
import { useDispatch, useSelector } from 'react-redux'
import { setBoardTab } from '@/store/slices/uiSlice'
import type { RootState } from '@/store'
import { useTranslations } from 'next-intl'
import { BedDouble, DoorOpen, ListFilter } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BoardTab } from '@/lib/boardView'

const tabs = [
  { key: 'all', Icon: ListFilter },
  { key: 'checkout', Icon: DoorOpen },
  { key: 'stayover', Icon: BedDouble },
] as const

interface TabCounts {
  total: number
  cleaned: number
  notCleaned: number
}

interface Props {
  counts?: Record<BoardTab, TabCounts>
}

export function BoardTabs({ counts }: Props) {
  const dispatch = useDispatch()
  const active = useSelector((s: RootState) => s.ui.boardTab)
  const t = useTranslations('board')

  return (
    <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-3 py-1.5" role="tablist" aria-label={t('title')}>
      {tabs.map(({ key: tab, Icon }) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={active === tab}
          onClick={() => dispatch(setBoardTab(tab))}
          className={cn(
            'min-h-11 min-w-fit flex-1 rounded-lg border px-3 py-1.5 text-left text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
            active === tab
              ? 'border-blue-300 bg-blue-50 text-blue-800 shadow-sm shadow-blue-100'
              : 'border-slate-200 bg-white text-slate-600'
          )}
        >
          <span className="flex items-center gap-1.5 leading-none">
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t(tab)}
          </span>
          {counts != null && (
            <span
              className="mt-1 block text-xs font-semibold text-slate-500"
              aria-label={t('tabCountLabel', {
                total: counts[tab].total,
                cleaned: counts[tab].cleaned,
                notCleaned: counts[tab].notCleaned,
              })}
            >
              <span className="font-semibold text-slate-800">{counts[tab].total}</span>
              <span className="mx-1 text-slate-300">·</span>
              <span className="text-emerald-700">{counts[tab].cleaned}</span>
              <span className="mx-0.5 text-slate-300">/</span>
              <span className="text-amber-700">{counts[tab].notCleaned}</span>
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
