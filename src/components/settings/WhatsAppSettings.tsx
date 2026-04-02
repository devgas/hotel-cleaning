'use client'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AppSettings } from '@/types'

interface Props {
  settings: Partial<AppSettings>
  onChange: (s: Partial<AppSettings>) => void
}

export function WhatsAppSettings({ settings, onChange }: Props) {
  const t = useTranslations('settings')

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700">{t('whatsapp')}</h3>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="wa-enabled"
          checked={settings.whatsappEnabled ?? false}
          onChange={(e) => onChange({ whatsappEnabled: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="wa-enabled">{t('whatsappEnabled')}</Label>
      </div>
      {settings.whatsappEnabled && (
        <>
          <div className="space-y-1">
            <Label>{t('whatsappPhone')}</Label>
            <Input
              value={settings.whatsappPhone ?? ''}
              onChange={(e) => onChange({ whatsappPhone: e.target.value })}
              placeholder="+380991234567"
            />
          </div>
          <div className="space-y-1">
            <Label>{t('whatsappTemplate')}</Label>
            <Input
              value={settings.whatsappMessageTemplate ?? ''}
              onChange={(e) => onChange({ whatsappMessageTemplate: e.target.value })}
              placeholder={t('whatsappTemplatePlaceholder')}
            />
            <p className="text-xs text-gray-400">{t('whatsappTemplateHint')}</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="wa-after-cleaned"
              checked={settings.whatsappAllowAfterCleaned ?? false}
              onChange={(e) => onChange({ whatsappAllowAfterCleaned: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="wa-after-cleaned">{t('whatsappAllowAfterCleaned')}</Label>
          </div>
        </>
      )}
    </div>
  )
}
