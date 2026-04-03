'use client'
import { useDispatch, useSelector } from 'react-redux'
import { setBoardTab } from '@/store/slices/uiSlice'
import type { RootState } from '@/store'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

type Tab = 'all' | 'priority' | 'checkout' | 'stayover'
const tabs: Tab[] = ['all', 'priority', 'checkout', 'stayover']

interface TabCounts {
  total: number
  cleaned: number
  notCleaned: number
}

interface Props {
  counts?: Record<Tab, TabCounts>
}

export function BoardTabs({ counts }: Props) {
  const dispatch = useDispatch()
  const active = useSelector((s: RootState) => s.ui.boardTab)
  const t = useTranslations('board')

  return (
    <div className="flex bg-white border-b">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => dispatch(setBoardTab(tab))}
          className={cn(
            'flex-1 px-1 py-2 text-sm font-medium border-b-2 transition-colors flex flex-col items-center gap-0.5',
            active === tab
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500'
          )}
        >
          <span>{t(tab)}</span>
          {counts != null && (
            <span className="flex items-center gap-1 text-[10px] font-semibold leading-none">
              <span className="text-green-600">{counts[tab].cleaned}</span>
              <span className="text-gray-300">/</span>
              <span className="text-red-500">{counts[tab].notCleaned}</span>
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
