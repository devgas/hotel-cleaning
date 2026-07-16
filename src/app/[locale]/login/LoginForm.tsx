'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  KeyRound,
  Loader2,
  LockKeyhole,
  Smartphone,
  UserPlus,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { InstallAppButton } from '@/components/pwa/InstallAppButton'

export function LoginForm() {
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
      setError(t('loginErrorInvalid'))
    } else if (res?.url) {
      window.location.href = res.url
    } else {
      setError(t('loginErrorFailed'))
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
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                {t('checkpointLabel')}
              </div>
              <div className="mt-10 space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#f4c95d]">
                  {t('shiftAccess')}
                </p>
                <h1 className="max-w-sm text-4xl font-semibold leading-tight">{t('loginTitle')}</h1>
                <p className="max-w-sm text-base leading-7 text-white/72">{t('loginSubtitle')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/12 bg-white/[0.07] p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4c95d] text-slate-950">
                    <BadgeCheck className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-medium">{t('readyForShiftTitle')}</p>
                    <p className="mt-1 text-sm leading-6 text-white/68">{t('readyForShiftText')}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium uppercase tracking-[0.12em] text-white/64">
                <div className="rounded-xl border border-white/10 bg-white/[0.06] px-2 py-3">
                  {t('statusRooms')}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.06] px-2 py-3">
                  {t('statusTasks')}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.06] px-2 py-3">
                  {t('statusTeam')}
                </div>
              </div>
            </div>
          </section>

          <section className="flex min-h-screen flex-col justify-center px-4 py-5 sm:min-h-0 sm:px-8 sm:py-10 lg:px-12">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.16em] text-emerald-700">
                    {t('checkpointLabel')}
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold leading-tight">{t('loginTitle')}</h1>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#243126] text-white">
                  <ClipboardCheck className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>

              <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm leading-6 text-emerald-950 lg:hidden">
                {t('loginSubtitle')}
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
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="password" className="text-slate-700">
                      {t('password')}
                    </Label>
                    <Link
                      href={`/${locale}/reset-password`}
                      className="text-sm font-medium text-emerald-700 underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-emerald-700/30"
                    >
                      {t('resetPassword')}
                    </Link>
                  </div>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      aria-invalid={Boolean(error)}
                      className="h-12 rounded-2xl bg-white pl-10 text-base shadow-sm"
                      placeholder={t('passwordPlaceholder')}
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

                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full rounded-2xl bg-[#243126] text-base text-white hover:bg-[#1d291f]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                      {t('loginLoading')}
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-5 w-5" aria-hidden="true" />
                      {t('login')}
                      <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href={`/${locale}/register`}
                  className="group flex min-h-20 items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-emerald-700/25"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                    <UserPlus className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-950">{t('register')}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{t('registerHint')}</span>
                  </span>
                </Link>
                <Link
                  href={`/${locale}/reset-password`}
                  className="group flex min-h-20 items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-amber-200 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-amber-600/25"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
                    <KeyRound className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-950">{t('accessHelpTitle')}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{t('accessHelpText')}</span>
                  </span>
                </Link>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#76b7a8]/20 text-[#1f6d60]">
                    <Smartphone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-950">{t('installAppTitle')}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{t('installAppMessage')}</p>
                    <div className="mt-3">
                      <InstallAppButton compact />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
