'use client'
import { useTranslations } from 'next-intl'

interface Props {
  total: number
  cleaned: number
  notNeeded: number
  notCleaned: number
}

export function SummaryCounters({ total, cleaned, notNeeded, notCleaned }: Props) {
  const t = useTranslations('board')
  return (
    <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-white border-b">
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{cleaned}</div>
        <div className="text-xs text-gray-500">{t('cleaned')}</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-amber-600">{notCleaned}</div>
        <div className="text-xs text-gray-500">{t('notCleaned')}</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-400">{notNeeded}</div>
        <div className="text-xs text-gray-500">{t('notNeeded')}</div>
      </div>
    </div>
  )
}
