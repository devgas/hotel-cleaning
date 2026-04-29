import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { defaultPriorityTime, isValidPriorityTime } from '@/lib/dailyPlans/priorityTime'
import { isStayoverRoomType, roomTypeOptions, toDbRoomType } from '@/lib/roomTypes'

const typeSchema = z.object({
  roomType: z.enum(roomTypeOptions),
  priority: z.boolean().optional(),
  priorityTime: z.string().nullable().optional(),
  guestCount: z.number().int().min(1).max(5).optional(),
}).superRefine((value, ctx) => {
  if (!value.priority) return

  if (!isValidPriorityTime(value.priorityTime)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['priorityTime'],
      message: 'Priority time must be between 09:00 and 23:00',
    })
  }
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = typeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const userId = parseInt(session.user!.id!)
  const { id } = await params
  const planRoomId = parseInt(id)

  const current = await prisma.dailyPlanRoom.findUnique({ where: { id: planRoomId } })
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const nextRoomType = toDbRoomType(parsed.data.roomType)
  const nextPriority = nextRoomType === 'checkout' ? parsed.data.priority ?? current.priority : false

  const updated = await prisma.dailyPlanRoom.update({
    where: { id: planRoomId },
    data: {
      roomType: nextRoomType,
      priority: nextPriority,
      priorityTime:
        isStayoverRoomType(parsed.data.roomType)
          ? null
          : nextPriority
            ? (parsed.data.priorityTime ?? current.priorityTime ?? defaultPriorityTime)
            : null,
      guestCount: parsed.data.guestCount ?? current.guestCount,
      updatedByUserId: userId,
      history: {
        create: {
          oldStatus: current.status,
          newStatus: current.status,
          oldRoomType: current.roomType,
          newRoomType: nextRoomType,
          changedByUserId: userId,
        },
      },
    },
  })

  return NextResponse.json({
    roomType: parsed.data.roomType,
    priority: updated.priority,
    priorityTime: updated.priorityTime,
    guestCount: updated.guestCount,
  })
}
