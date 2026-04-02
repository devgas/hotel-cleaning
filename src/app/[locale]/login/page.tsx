'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  const t = useTranslations('auth')
  const { locale } = useParams<{ locale: string }>()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const trimmedName = name.trim()
    const trimmedPassword = password.trim()

    const res = await signIn('credentials', {
      name: trimmedName,
      password: trimmedPassword,
      redirect: false,
      callbackUrl: `/${locale}/board`,
    })

    if (res?.error) {
      setError('Invalid name or password')
    } else if (res?.url) {
      window.location.href = res.url
    } else {
      setError('Login failed')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">{t('loginTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">{t('name')}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">{t('password')}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '...' : t('login')}
            </Button>
            <p className="text-center text-sm text-gray-500">
              <Link href={`/${locale}/reset-password`} className="text-blue-600 underline">
                {t('resetPassword')}
              </Link>
            </p>
            <p className="text-center text-sm text-gray-500">
              <Link href={`/${locale}/register`} className="text-blue-600 underline">
                {t('register')}
              </Link>
            </p>
          </form>
          <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
            <p className="font-medium">{t('installAppTitle')}</p>
            <p className="mt-1 text-blue-800">{t('installAppMessage')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
