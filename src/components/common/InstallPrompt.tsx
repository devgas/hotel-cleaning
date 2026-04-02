'use client'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIos, setIsIos] = useState(false)
  const [isStandalone, setIsStandalone] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
    setIsStandalone(standalone)

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIos(ios)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (isStandalone || dismissed) return null

  // Android / Chrome: native prompt available
  if (deferredPrompt) {
    return (
      <div className="fixed bottom-20 inset-x-0 z-50 px-4 pb-2">
        <div className="bg-blue-600 text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg">
          <span className="text-sm font-medium">📲 Встановити застосунок</span>
          <div className="flex gap-2">
            <button
              onClick={() => setDismissed(true)}
              className="text-blue-200 text-xs px-2 py-1"
            >
              Пізніше
            </button>
            <button
              onClick={async () => {
                await deferredPrompt.prompt()
                const { outcome } = await deferredPrompt.userChoice
                if (outcome === 'accepted' || outcome === 'dismissed') {
                  setDeferredPrompt(null)
                  setDismissed(true)
                }
              }}
              className="bg-white text-blue-700 text-xs font-semibold px-3 py-1 rounded-xl"
            >
              Встановити
            </button>
          </div>
        </div>
      </div>
    )
  }

  // iOS Safari: show instructions
  if (isIos) {
    return (
      <div className="fixed bottom-20 inset-x-0 z-50 px-4 pb-2">
        <div className="bg-gray-800 text-white rounded-2xl px-4 py-3 shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm">
              📲 Натисніть <strong>Поділитися</strong> → <strong>На екран «Додому»</strong>
            </p>
            <button onClick={() => setDismissed(true)} className="text-gray-400 text-lg leading-none flex-shrink-0">×</button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
