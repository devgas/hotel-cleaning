import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
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
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existing = await prisma.dailyPlan.findUnique({
    where: { hotelId_date: { hotelId, date: today } },
  })

  if (existing) {
    await prisma.dailyPlanRoom.deleteMany({ where: { dailyPlanId: existing.id } })
    await prisma.dailyPlanRoom.createMany({
      data: parsed.data.rooms.map((r) => ({
        dailyPlanId: existing.id,
        roomId: r.roomId,
        roomType: r.roomType,
        priority: r.priority,
        status: 'not_cleaned_yet' as const,
        updatedByUserId: userId,
      })),
    })
    return NextResponse.json({ id: existing.id }, { status: 200 })
  }

  const plan = await prisma.dailyPlan.create({
    data: {
      hotelId,
      date: today,
      createdByUserId: userId,
      rooms: {
        create: parsed.data.rooms.map((r) => ({
          roomId: r.roomId,
          roomType: r.roomType,
          priority: r.priority,
          status: 'not_cleaned_yet' as const,
          updatedByUserId: userId,
        })),
      },
    },
  })

  return NextResponse.json({ id: plan.id }, { status: 201 })
}
