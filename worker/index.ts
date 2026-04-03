export {}

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return
  const data = event.data.json() as { title: string; body: string }
  event.waitUntil(
    (self as unknown as ServiceWorkerGlobalScope).registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
    })
  )
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  event.waitUntil(
    (self as unknown as ServiceWorkerGlobalScope).clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus()
      }
      return (self as unknown as ServiceWorkerGlobalScope).clients.openWindow('/')
    })
  )
})
