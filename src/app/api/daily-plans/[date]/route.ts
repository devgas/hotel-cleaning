import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
import { sortByRoomNumber } from '@/lib/sortRooms'
import { parsePlanDate } from '@/lib/dailyPlans/planDate'
import { fromDbRoomType } from '@/lib/roomTypes'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')
  const { date: dateStr } = await params
  const date = parsePlanDate(dateStr)
  if (!date) return NextResponse.json({ error: 'Invalid date' }, { status: 400 })

  const plan = await prisma.dailyPlan.findUnique({
    where: { hotelId_date: { hotelId, date } },
    include: {
      rooms: {
        include: {
          room: { select: { roomNumber: true } },
          updatedBy: { select: { name: true } },
        },
      },
    },
  })

  if (!plan) return NextResponse.json(null)

  const sorted = sortByRoomNumber(plan.rooms, (r) => r.room.roomNumber)

  return NextResponse.json({
    id: plan.id,
    date: plan.date.toISOString().split('T')[0],
    rooms: sorted.map((r) => ({
      dailyPlanRoomId: r.id,
      roomId: r.roomId,
      roomNumber: r.room.roomNumber,
      roomType: fromDbRoomType(r.roomType),
      priority: r.priority,
      priorityTime: r.priorityTime,
      guestCount: r.guestCount,
      status: r.status,
      updatedBy: r.updatedBy?.name ?? null,
      updatedAt: r.updatedAt.toISOString(),
    })),
  })
}
