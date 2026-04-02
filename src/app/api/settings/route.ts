import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const settingsSchema = z.object({
  defaultLanguage: z.enum(['uk', 'en']).optional(),
  whatsappEnabled: z.boolean().optional(),
  whatsappChatLink: z.string().optional(),
  whatsappPhone: z.string().optional(),
  whatsappMessageTemplate: z.string().optional(),
  whatsappAllowAfterCleaned: z.boolean().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')

  const rows = await prisma.appSetting.findMany({
    where: { hotelId, key: { not: 'admin_password_hash' } },
  })

  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))

  return NextResponse.json({
    defaultLanguage: map['default_language'] ?? 'uk',
    whatsappEnabled: map['whatsapp_enabled'] === 'true',
    whatsappChatLink: map['whatsapp_chat_link'] ?? '',
    whatsappPhone: map['whatsapp_phone'] ?? '',
    whatsappMessageTemplate: map['whatsapp_message_template'] ?? 'Кімната {room} прибрана',
    whatsappAllowAfterCleaned: map['whatsapp_allow_after_cleaned'] === 'true',
  })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = settingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')
  const updates: [string, string][] = []

  if (parsed.data.defaultLanguage !== undefined)
    updates.push(['default_language', parsed.data.defaultLanguage])
  if (parsed.data.whatsappEnabled !== undefined)
    updates.push(['whatsapp_enabled', String(parsed.data.whatsappEnabled)])
  if (parsed.data.whatsappChatLink !== undefined)
    updates.push(['whatsapp_chat_link', parsed.data.whatsappChatLink])
  if (parsed.data.whatsappPhone !== undefined)
    updates.push(['whatsapp_phone', parsed.data.whatsappPhone])
  if (parsed.data.whatsappMessageTemplate !== undefined)
    updates.push(['whatsapp_message_template', parsed.data.whatsappMessageTemplate])
  if (parsed.data.whatsappAllowAfterCleaned !== undefined)
    updates.push(['whatsapp_allow_after_cleaned', String(parsed.data.whatsappAllowAfterCleaned)])

  await Promise.all(
    updates.map(([key, value]) =>
      prisma.appSetting.upsert({
        where: { hotelId_key: { hotelId, key } },
        update: { value },
        create: { hotelId, key, value },
      })
    )
  )

  return NextResponse.json({ ok: true })
}
