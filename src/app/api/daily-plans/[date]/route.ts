import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')
  const { date: dateStr } = await params
  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)

  const plan = await prisma.dailyPlan.findUnique({
    where: { hotelId_date: { hotelId, date } },
    include: {
      rooms: {
        include: {
          room: { select: { roomNumber: true } },
          updatedBy: { select: { name: true } },
        },
        orderBy: { room: { roomNumber: 'asc' } },
      },
    },
  })

  if (!plan) return NextResponse.json(null)

  return NextResponse.json({
    id: plan.id,
    date: plan.date.toISOString().split('T')[0],
    rooms: plan.rooms.map((r) => ({
      dailyPlanRoomId: r.id,
      roomId: r.roomId,
      roomNumber: r.room.roomNumber,
      roomType: r.roomType,
      priority: r.priority,
      status: r.status,
      updatedBy: r.updatedBy?.name ?? null,
      updatedAt: r.updatedAt.toISOString(),
    })),
  })
}
