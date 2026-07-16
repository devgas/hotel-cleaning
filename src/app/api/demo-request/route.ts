import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const demoRequestSchema = z.object({
  hotel: z.string().trim().min(2).max(120),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  rooms: z.coerce.number().int().min(1).max(10000).optional(),
  focus: z.string().trim().min(2).max(120),
  workflow: z.string().trim().max(2000).optional(),
})

const contactEmail = 'hotel.cleaning.app.info@gmail.com'

function buildMailtoUrl(data: z.infer<typeof demoRequestSchema>) {
  const subject = `Hotel Cleaning demo request: ${data.hotel}`
  const body = [
    `Hotel/company: ${data.hotel}`,
    `Contact: ${data.name}`,
    `Email: ${data.email}`,
    `Rooms: ${data.rooms ?? 'Not specified'}`,
    `Demo focus: ${data.focus}`,
    '',
    'Current workflow or problem:',
    data.workflow || 'Not specified',
  ].join('\n')

  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = demoRequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  // There is no transactional email provider configured in this project yet.
  // Keep the request structured for logs and return a prefilled email fallback.
  console.info('Demo request submitted', parsed.data)

  return NextResponse.json({
    ok: true,
    mailtoUrl: buildMailtoUrl(parsed.data),
    contactEmail,
  })
}
