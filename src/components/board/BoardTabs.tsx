'use client'
import { useDispatch, useSelector } from 'react-redux'
import { setBoardTab } from '@/store/slices/uiSlice'
import type { RootState } from '@/store'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

type Tab = 'all' | 'priority' | 'checkout' | 'stayover'
const tabs: Tab[] = ['all', 'priority', 'checkout', 'stayover']

export function BoardTabs() {
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
            'flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            active === tab
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500'
          )}
        >
          {t(tab)}
        </button>
      ))}
    </div>
  )
}
