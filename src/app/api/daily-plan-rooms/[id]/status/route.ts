import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
import { sendPushToSubscriptions } from '@/lib/webpush'
import { z } from 'zod'

const statusSchema = z.object({
  status: z.enum(['not_cleaned_yet', 'cleaned', 'not_needed']),
  sendMessageUsed: z.boolean().optional().default(false),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = statusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const userId = parseInt(session.user!.id!)
  const { id } = await params
  const planRoomId = parseInt(id)

  const current = await prisma.dailyPlanRoom.findUnique({
    where: { id: planRoomId },
    include: { room: { select: { roomNumber: true } }, dailyPlan: { select: { hotelId: true } } },
  })
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.dailyPlanRoom.update({
    where: { id: planRoomId },
    data: {
      status: parsed.data.status,
      updatedByUserId: userId,
      history: {
        create: {
          oldStatus: current.status,
          newStatus: parsed.data.status,
          oldRoomType: current.roomType,
          newRoomType: current.roomType,
          changedByUserId: userId,
          sendMessageUsed: parsed.data.sendMessageUsed,
        },
      },
    },
    include: { updatedBy: { select: { name: true } } },
  })

  if (parsed.data.status === 'cleaned' || parsed.data.status === 'not_needed') {
    const hotelId = current.dailyPlan.hotelId
    const roomNumber = current.room.roomNumber
    const label = parsed.data.status === 'cleaned' ? '✅ Прибрано' : '🚫 Нерушенка'
    const subscriptions = await prisma.pushSubscription.findMany({ where: { hotelId } })
    if (subscriptions.length > 0) {
      sendPushToSubscriptions(subscriptions, {
        title: `Кімната ${roomNumber}`,
        body: `${label} — ${updated.updatedBy?.name ?? 'невідомо'}`,
      }).catch(() => {})
    }
  }

  return NextResponse.json({
    status: updated.status,
    updatedBy: updated.updatedBy?.name ?? null,
    updatedAt: updated.updatedAt.toISOString(),
  })
}
