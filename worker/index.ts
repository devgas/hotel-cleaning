export {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sw = self as any

sw.addEventListener('push', (event: { data: { json: () => { title: string; body: string } } | null; waitUntil: (p: Promise<unknown>) => void }) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    sw.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
    })
  )
})

sw.addEventListener('notificationclick', (event: { notification: { close: () => void }; waitUntil: (p: Promise<unknown>) => void }) => {
  event.notification.close()
  event.waitUntil(
    sw.clients.matchAll({ type: 'window' }).then((clientList: { focus: () => Promise<unknown> }[]) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus()
      }
      return sw.clients.openWindow('/')
    })
  )
})
