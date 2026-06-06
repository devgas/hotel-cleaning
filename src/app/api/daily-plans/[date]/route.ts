import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
import { sortByRoomNumber } from '@/lib/sortRooms'
import { parsePlanDate } from '@/lib/dailyPlans/planDate'
import { fromDbRoomType } from '@/lib/roomTypes'
import { getDaysSinceCleaned } from '@/lib/cleaningRecency'

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
  const roomIds = sorted.map((room) => room.roomId)
  const lastCleanedRows = roomIds.length > 0
    ? await prisma.dailyPlanRoom.findMany({
        where: {
          roomId: { in: roomIds },
          status: 'cleaned',
          dailyPlan: {
            hotelId,
            date: { lt: plan.date },
          },
        },
        select: {
          roomId: true,
          dailyPlan: { select: { date: true } },
        },
        orderBy: [
          { dailyPlan: { date: 'desc' } },
          { id: 'desc' },
        ],
      })
    : []
  const lastCleanedByRoomId = new Map<number, string>()
  for (const row of lastCleanedRows) {
    if (!lastCleanedByRoomId.has(row.roomId)) {
      lastCleanedByRoomId.set(row.roomId, row.dailyPlan.date.toISOString().split('T')[0])
    }
  }
  const planDate = plan.date.toISOString().split('T')[0]

  return NextResponse.json({
    id: plan.id,
    date: planDate,
    rooms: sorted.map((r) => ({
      dailyPlanRoomId: r.id,
      roomId: r.roomId,
      roomNumber: r.room.roomNumber,
      roomType: fromDbRoomType(r.roomType),
      priority: r.priority,
      priorityTime: r.priorityTime,
      guestCount: r.guestCount,
      status: r.status,
      daysSinceLastCleaned: getDaysSinceCleaned(planDate, lastCleanedByRoomId.get(r.roomId) ?? null),
      updatedBy: r.updatedBy?.name ?? null,
      updatedAt: r.updatedAt.toISOString(),
    })),
  })
}
