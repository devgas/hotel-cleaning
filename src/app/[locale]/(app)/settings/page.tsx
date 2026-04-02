'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/common/Header'
import { RoomManager } from '@/components/settings/RoomManager'
import { WhatsAppSettings } from '@/components/settings/WhatsAppSettings'
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/store/api/settingsApi'
import { Button } from '@/components/ui/button'
import type { AppSettings } from '@/types'

export default function SettingsPage() {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const { locale } = useParams<{ locale: string }>()
  const router = useRouter()
  const { data: remoteSettings } = useGetSettingsQuery()
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation()
  const [localSettings, setLocalSettings] = useState<Partial<AppSettings>>({})
  const [saved, setSaved] = useState(false)
  const [clearPassword, setClearPassword] = useState('')
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [clearStatus, setClearStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [clearLoading, setClearLoading] = useState(false)

  useEffect(() => {
    if (remoteSettings) setLocalSettings(remoteSettings)
  }, [remoteSettings])

  function merge(patch: Partial<AppSettings>) {
    setLocalSettings((prev) => ({ ...prev, ...patch }))
  }

  async function handleClearPlan() {
    setClearLoading(true)
    setClearStatus('idle')
    const res = await fetch('/api/daily-plans/today', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: clearPassword }),
    })
    if (res.ok) {
      setClearStatus('success')
      setClearPassword('')
      setTimeout(() => { setShowClearDialog(false); setClearStatus('idle') }, 1500)
    } else {
      setClearStatus('error')
    }
    setClearLoading(false)
  }

  async function handleSave() {
    await updateSettings(localSettings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    if (localSettings.defaultLanguage && localSettings.defaultLanguage !== locale) {
      router.push(`/${localSettings.defaultLanguage}/settings`)
    }
  }

  return (
    <div>
      <Header title={t('title')} />
      <div className="p-4 space-y-6">
        <RoomManager />
        <WhatsAppSettings settings={localSettings} onChange={merge} />
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700">{t('language')}</h3>
          <div className="flex gap-2">
            {(['uk', 'en'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => merge({ defaultLanguage: lang })}
                className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                  localSettings.defaultLanguage === lang
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {t(lang === 'uk' ? 'languageUkrainian' : 'languageEnglish')}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={handleSave} className="w-full" disabled={isLoading}>
          {saved ? t('saved') : t('save')}
        </Button>

        <div className="space-y-2 pt-2 border-t border-gray-100">
          {!showClearDialog ? (
            <button
              onClick={() => { setShowClearDialog(true); setClearStatus('idle') }}
              className="w-full px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              {t('clearPlan')}
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{t('clearPlanConfirm')}</p>
              <input
                type="password"
                value={clearPassword}
                onChange={(e) => setClearPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                autoFocus
              />
              {clearStatus === 'error' && <p className="text-red-500 text-sm">{t('clearPlanError')}</p>}
              {clearStatus === 'success' && <p className="text-green-600 text-sm">✓ {t('clearPlanSuccess')}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowClearDialog(false); setClearPassword(''); setClearStatus('idle') }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm"
                >
                  {tCommon('cancel')}
                </button>
                <button
                  onClick={handleClearPlan}
                  disabled={clearLoading || !clearPassword}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium disabled:opacity-50"
                >
                  {clearLoading ? '...' : t('clearPlan')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
