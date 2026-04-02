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
  const { locale } = useParams<{ locale: string }>()
  const router = useRouter()
  const { data: remoteSettings } = useGetSettingsQuery()
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation()
  const [localSettings, setLocalSettings] = useState<Partial<AppSettings>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (remoteSettings) setLocalSettings(remoteSettings)
  }, [remoteSettings])

  function merge(patch: Partial<AppSettings>) {
    setLocalSettings((prev) => ({ ...prev, ...patch }))
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
                {lang === 'uk' ? 'Українська' : 'English'}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={handleSave} className="w-full" disabled={isLoading}>
          {saved ? t('saved') : t('save')}
        </Button>
      </div>
    </div>
  )
}
