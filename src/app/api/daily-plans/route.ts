import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
import { parsePlanDate } from '@/lib/dailyPlans/planDate'
import { validateDailyPlanInput } from '@/lib/dailyPlans/validateDailyPlan'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = validateDailyPlanInput(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')
  const userId = parseInt(session.user!.id!)
  const targetDate = parsed.data.date ? parsePlanDate(parsed.data.date) : new Date()
  if (!targetDate) {
    return NextResponse.json({ error: { date: ['Invalid date'] } }, { status: 400 })
  }
  targetDate.setHours(0, 0, 0, 0)

  const existing = await prisma.dailyPlan.findUnique({
    where: { hotelId_date: { hotelId, date: targetDate } },
    include: {
      rooms: {
        select: {
          id: true,
          roomId: true,
        },
      },
    },
  })

  if (existing) {
    const selectedRoomIds = new Set(parsed.data.rooms.map((room) => room.roomId))
    const roomsToRemove = existing.rooms.filter((room) => !selectedRoomIds.has(room.roomId))
    const roomIdsToRemove = roomsToRemove.map((room) => room.id)
    const existingRoomMap = new Map(existing.rooms.map((room) => [room.roomId, room.id]))

    await prisma.$transaction(async (tx) => {
      if (roomIdsToRemove.length > 0) {
        await tx.statusHistory.deleteMany({
          where: { dailyPlanRoomId: { in: roomIdsToRemove } },
        })

        await tx.dailyPlanRoom.deleteMany({
          where: { id: { in: roomIdsToRemove } },
        })
      }

      for (const room of parsed.data.rooms) {
        const existingPlanRoomId = existingRoomMap.get(room.roomId)

        if (existingPlanRoomId) {
          await tx.dailyPlanRoom.update({
            where: { id: existingPlanRoomId },
            data: {
              roomType: room.roomType,
              priority: room.priority,
              priorityTime: room.priority ? room.priorityTime ?? '09:00' : null,
              updatedByUserId: userId,
            },
          })
          continue
        }

        await tx.dailyPlanRoom.create({
          data: {
            dailyPlanId: existing.id,
            roomId: room.roomId,
            roomType: room.roomType,
            priority: room.priority,
            status: 'not_cleaned_yet',
            updatedByUserId: userId,
          },
        })
      }

      await tx.dailyPlan.update({
        where: { id: existing.id },
        data: { createdByUserId: userId },
      })
    })

    return NextResponse.json({ id: existing.id }, { status: 200 })
  }

  const plan = await prisma.dailyPlan.create({
    data: {
      hotelId,
      date: targetDate,
      createdByUserId: userId,
      rooms: {
        create: parsed.data.rooms.map((r) => ({
          roomId: r.roomId,
            roomType: r.roomType,
            priority: r.priority,
            priorityTime: r.priority ? r.priorityTime ?? '09:00' : null,
            status: 'not_cleaned_yet' as const,
            updatedByUserId: userId,
          })),
      },
    },
  })

  return NextResponse.json({ id: plan.id }, { status: 201 })
}
