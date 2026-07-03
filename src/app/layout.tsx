import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ReduxProvider } from '@/store/provider'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#006b63',
}

export const metadata: Metadata = {
  title: 'Hotel Cleaning',
  description: 'Hotel housekeeping management',
  manifest: '/manifest.json',
  icons: {
    icon: '/hotel-cleaning-app-icon.png',
    apple: '/hotel-cleaning-app-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hotel Cleaning',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body className={inter.className}>
        <ReduxProvider>{children}</ReduxProvider>
        <ServiceWorkerRegistration />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
