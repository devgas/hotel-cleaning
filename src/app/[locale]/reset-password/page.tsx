'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const t = useTranslations('auth')
  const { locale } = useParams<{ locale: string }>()
  const router = useRouter()
  const [name, setName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        newPassword: newPassword.trim(),
        adminPassword: adminPassword.trim(),
      }),
    })

    if (res.ok) {
      setSuccess(true)
      setTimeout(() => router.push(`/${locale}/login`), 1500)
    } else {
      const data = await res.json().catch(() => null)
      setError(typeof data?.error === 'string' ? data.error : t('loginErrorFailed'))
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#f6f7f3] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[0.92fr_1.08fr]">
          <section className="relative hidden min-h-[620px] flex-col justify-between bg-[#243126] p-8 text-white lg:flex">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#f4c95d_0_30%,#76b7a8_30%_68%,#ffffff_68%_100%)]" />
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white/85">
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                {t('resetPassword')}
              </div>
              <div className="mt-10 space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#f4c95d]">
                  {t('checkpointLabel')}
                </p>
                <h1 className="max-w-sm text-4xl font-semibold leading-tight">{t('resetPasswordTitle')}</h1>
                <p className="max-w-sm text-base leading-7 text-white/72">{t('resetPasswordSubtitle')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/12 bg-white/[0.07] p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4c95d] text-slate-950">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-medium">{t('resetPanelTitle')}</p>
                    <p className="mt-1 text-sm leading-6 text-white/68">{t('resetPanelText')}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium uppercase tracking-[0.12em] text-white/64">
                <div className="rounded-xl border border-white/10 bg-white/[0.06] px-2 py-3">
                  {t('statusTeam')}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.06] px-2 py-3">
                  {t('statusRooms')}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.06] px-2 py-3">
                  {t('statusTasks')}
                </div>
              </div>
            </div>
          </section>

          <section className="flex min-h-screen flex-col justify-center px-4 py-5 sm:min-h-0 sm:px-8 sm:py-10 lg:px-12">
            <div className="mx-auto w-full max-w-md">
              <Link
                href={`/${locale}/login`}
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-emerald-700/25"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t('backToLogin')}
              </Link>

              <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.16em] text-emerald-700">
                    {t('checkpointLabel')}
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold leading-tight">{t('resetPasswordTitle')}</h1>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#243126] text-white">
                  <ClipboardCheck className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>

              <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm leading-6 text-emerald-950 lg:hidden">
                {t('resetPasswordSubtitle')}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700">
                    {t('name')}
                  </Label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <Input
                      id="name"
                      autoComplete="username"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      aria-invalid={Boolean(error)}
                      className="h-12 rounded-2xl bg-white pl-10 text-base shadow-sm"
                      placeholder={t('namePlaceholder')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-slate-700">
                    {t('newPassword')}
                  </Label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <Input
                      id="newPassword"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      aria-invalid={Boolean(error)}
                      className="h-12 rounded-2xl bg-white pl-10 text-base shadow-sm"
                      placeholder={t('newPasswordPlaceholder')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword" className="text-slate-700">
                    {t('adminPassword')}
                  </Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <Input
                      id="adminPassword"
                      type="password"
                      autoComplete="current-password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      aria-invalid={Boolean(error)}
                      className="h-12 rounded-2xl bg-white pl-10 text-base shadow-sm"
                      placeholder={t('adminPasswordPlaceholder')}
                    />
                  </div>
                </div>

                {error && (
                  <div
                    className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-3 text-sm leading-5 text-red-800"
                    role="alert"
                    aria-live="polite"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div
                    className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm leading-5 text-emerald-900"
                    role="status"
                    aria-live="polite"
                  >
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{t('resetPasswordSuccess')}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full rounded-2xl bg-[#243126] text-base text-white hover:bg-[#1d291f]"
                  disabled={loading || success}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                      {t('resetPasswordLoading')}
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-5 w-5" aria-hidden="true" />
                      {t('resetPassword')}
                      <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
