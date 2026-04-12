'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

type State = 'loading' | 'unsupported' | 'denied' | 'enabled' | 'disabled'

export function NotificationToggle() {
  const t = useTranslations('settings')
  const [state, setState] = useState<State>('loading')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !VAPID_PUBLIC_KEY) {
      setState('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setState('denied')
      return
    }
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription()
      setState(sub ? 'enabled' : 'disabled')
    })
  }, [])

  async function enable() {
    setBusy(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState('denied')
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      const json = sub.toJSON()
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
        }),
      })
      setState('enabled')
    } catch {
      setState('disabled')
    } finally {
      setBusy(false)
    }
  }

  async function disable() {
    setBusy(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setState('disabled')
    } finally {
      setBusy(false)
    }
  }

  if (state === 'loading' || state === 'unsupported') return null

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-700">{t('notifications')}</h3>
      {state === 'denied' ? (
        <p className="text-sm text-gray-400">{t('notificationsDenied')}</p>
      ) : (
        <button
          onClick={state === 'enabled' ? disable : enable}
          disabled={busy}
          className={`w-full px-4 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${
            state === 'enabled'
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'border-gray-200 text-gray-600'
          }`}
        >
          {busy ? '...' : state === 'enabled' ? t('notificationsOn') : t('notificationsOff')}
        </button>
      )}
    </div>
  )
}
