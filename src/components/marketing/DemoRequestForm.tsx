'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2, Send } from 'lucide-react'

const focusOptions = [
  'Daily room cleaning board',
  'Checkout and stayover planning',
  'Team status and accountability',
  'Custom hotel setup',
]

export function DemoRequestForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [mailtoUrl, setMailtoUrl] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')
    setMailtoUrl('')

    const form = event.currentTarget
    const formData = new FormData(form)

    const payload = {
      hotel: String(formData.get('hotel') ?? ''),
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      rooms: formData.get('rooms') ? Number(formData.get('rooms')) : undefined,
      focus: String(formData.get('focus') ?? focusOptions[0]),
      workflow: String(formData.get('workflow') ?? ''),
    }

    const response = await fetch('/api/demo-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => null)

    if (!response?.ok) {
      setStatus('error')
      setMessage('The request could not be sent. Check the required fields and try again.')
      return
    }

    const data = await response.json().catch(() => null)
    const nextMailtoUrl = typeof data?.mailtoUrl === 'string' ? data.mailtoUrl : ''
    setMailtoUrl(nextMailtoUrl)
    setStatus('success')
    setMessage('Request prepared. Your email app should open with the demo details.')
    form.reset()

    if (nextMailtoUrl) {
      window.location.href = nextMailtoUrl
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-3xl border border-[#d9eeea] bg-[#f7faf9] p-4 sm:grid-cols-2 sm:p-5"
    >
      <label className="grid gap-2 text-sm font-bold text-[#071a3a]">
        Hotel or company
        <input
          name="hotel"
          required
          className="h-12 rounded-2xl border border-[#c9dedb] bg-white px-4 text-base font-medium text-[#071a3a] outline-none transition placeholder:text-[#6f839d] focus:border-[#0d9488] focus:ring-3 focus:ring-[#0d9488]/20"
          placeholder="Hotel name"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-[#071a3a]">
        Contact name
        <input
          name="name"
          required
          className="h-12 rounded-2xl border border-[#c9dedb] bg-white px-4 text-base font-medium text-[#071a3a] outline-none transition placeholder:text-[#6f839d] focus:border-[#0d9488] focus:ring-3 focus:ring-[#0d9488]/20"
          placeholder="Your name"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-[#071a3a]">
        Work email
        <input
          name="email"
          type="email"
          required
          className="h-12 rounded-2xl border border-[#c9dedb] bg-white px-4 text-base font-medium text-[#071a3a] outline-none transition placeholder:text-[#6f839d] focus:border-[#0d9488] focus:ring-3 focus:ring-[#0d9488]/20"
          placeholder="name@hotel.com"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-[#071a3a]">
        Rooms
        <input
          name="rooms"
          type="number"
          min="1"
          className="h-12 rounded-2xl border border-[#c9dedb] bg-white px-4 text-base font-medium text-[#071a3a] outline-none transition placeholder:text-[#6f839d] focus:border-[#0d9488] focus:ring-3 focus:ring-[#0d9488]/20"
          placeholder="48"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-[#071a3a] sm:col-span-2">
        What should the demo focus on?
        <select
          name="focus"
          className="h-12 rounded-2xl border border-[#c9dedb] bg-white px-4 text-base font-medium text-[#071a3a] outline-none transition focus:border-[#0d9488] focus:ring-3 focus:ring-[#0d9488]/20"
          defaultValue={focusOptions[0]}
        >
          {focusOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold text-[#071a3a] sm:col-span-2">
        Current workflow or problem
        <textarea
          name="workflow"
          rows={4}
          className="resize-none rounded-2xl border border-[#c9dedb] bg-white px-4 py-3 text-base font-medium leading-7 text-[#071a3a] outline-none transition placeholder:text-[#6f839d] focus:border-[#0d9488] focus:ring-3 focus:ring-[#0d9488]/20"
          placeholder="Example: We plan checkouts in a spreadsheet, then cleaners send updates in WhatsApp."
        />
      </label>

      {message && (
        <div
          className={
            status === 'success'
              ? 'flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm leading-5 text-emerald-900 sm:col-span-2'
              : 'flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-3 text-sm leading-5 text-red-800 sm:col-span-2'
          }
          role={status === 'success' ? 'status' : 'alert'}
          aria-live="polite"
        >
          {status === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span>
            {message}
            {mailtoUrl && (
              <>
                {' '}
                <a className="font-bold underline underline-offset-4" href={mailtoUrl}>
                  Open email again
                </a>
              </>
            )}
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#071a3a] px-5 text-base font-extrabold text-white shadow-[0_14px_30px_rgba(7,26,58,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0b244c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
      >
        <Send className="h-5 w-5" aria-hidden="true" />
        {status === 'loading' ? 'Sending request' : 'Send demo request'}
      </button>
    </form>
  )
}
