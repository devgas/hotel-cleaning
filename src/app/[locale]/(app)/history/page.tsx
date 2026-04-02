'use client'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/common/Header'
import { useGetHistoryQuery } from '@/store/api/dailyPlanApi'

export default function HistoryPage() {
  const t = useTranslations('history')
  const { locale } = useParams<{ locale: string }>()
  const { data: history = [], isLoading } = useGetHistoryQuery()

  return (
    <div>
      <Header title={t('title')} />
      <div className="p-4 space-y-3">
        {isLoading && <p className="text-gray-400 text-center">...</p>}
        {!isLoading && history.length === 0 && (
          <p className="text-gray-400 text-center">{t('noHistory')}</p>
        )}
        {history.map((day) => (
          <Link key={day.date} href={`/${locale}/history/${day.date}`}>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between active:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">{day.date}</p>
                <p className="text-xs text-gray-400">{t('total')}: {day.total}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <span className="text-green-600 font-semibold">{day.cleaned} ✓</span>
                <span className="text-gray-400">{day.notNeeded} –</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
