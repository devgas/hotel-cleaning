'use client'

import { useEffect, useState } from 'react'
import { Download, Smartphone } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isStandaloneMode() {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIosSafari() {
  if (typeof window === 'undefined') return false

  const ua = window.navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
}

export function InstallAppButton() {
  const t = useTranslations('settings')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [busy, setBusy] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [iosSafari, setIosSafari] = useState(false)

  useEffect(() => {
    setInstalled(isStandaloneMode())
    setIosSafari(isIosSafari())

    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => undefined)
    }

    const displayModeQuery = window.matchMedia?.('(display-mode: standalone)')
    const handleDisplayModeChange = () => setInstalled(isStandaloneMode())
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }
    const handleInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)
    displayModeQuery?.addEventListener?.('change', handleDisplayModeChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
      displayModeQuery?.removeEventListener?.('change', handleDisplayModeChange)
    }
  }, [])

  async function install() {
    if (!deferredPrompt) {
      setShowHint((current) => !current)
      return
    }

    setBusy(true)
    try {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
    } finally {
      setBusy(false)
      setDeferredPrompt(null)
    }
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-700">{t('installApp')}</h3>
      {installed ? (
        <p className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          <Smartphone className="h-4 w-4" aria-hidden="true" />
          {t('installAppInstalled')}
        </p>
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center"
            onClick={install}
            disabled={busy}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {busy ? t('installAppOpening') : t('installAppAction')}
          </Button>
          {(showHint || iosSafari || !deferredPrompt) && (
            <p className="text-xs text-gray-400">
              {iosSafari ? t('installAppIosHint') : t('installAppHint')}
            </p>
          )}
        </>
      )}
    </div>
  )
}
