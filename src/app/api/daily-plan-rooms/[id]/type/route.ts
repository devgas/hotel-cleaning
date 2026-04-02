import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const typeSchema = z.object({
  roomType: z.enum(['checkout', 'stayover']),
  priority: z.boolean().optional(),
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

  const updated = await prisma.dailyPlanRoom.update({
    where: { id: planRoomId },
    data: {
      roomType: parsed.data.roomType,
      priority: parsed.data.priority ?? current.priority,
      updatedByUserId: userId,
      history: {
        create: {
          oldStatus: current.status,
          newStatus: current.status,
          oldRoomType: current.roomType,
          newRoomType: parsed.data.roomType,
          changedByUserId: userId,
        },
      },
    },
  })

  return NextResponse.json({ roomType: updated.roomType, priority: updated.priority })
}
