'use client'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setOnline } from '@/store/slices/uiSlice'
import type { RootState } from '@/store'
import { useTranslations } from 'next-intl'

export function OfflineBanner() {
  const dispatch = useDispatch()
  const isOnline = useSelector((s: RootState) => s.ui.isOnline)
  const t = useTranslations('common')

  useEffect(() => {
    const handleOnline = () => dispatch(setOnline(true))
    const handleOffline = () => dispatch(setOnline(false))
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    dispatch(setOnline(navigator.onLine))
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [dispatch])

  if (isOnline) return null

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-red-500 text-white text-center text-sm py-2">
      {t('offline')}
    </div>
  )
}
