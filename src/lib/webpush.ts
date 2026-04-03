import webpush from 'web-push'

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!
const vapidEmail = process.env.VAPID_EMAIL ?? 'mailto:admin@hotel.local'

webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey)

export { webpush }

export async function sendPushToSubscriptions(
  subscriptions: { endpoint: string; p256dh: string; auth: string }[],
  payload: { title: string; body: string }
) {
  await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  )
}
