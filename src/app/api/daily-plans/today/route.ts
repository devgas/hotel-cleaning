import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const plan = await prisma.dailyPlan.findUnique({
    where: { hotelId_date: { hotelId, date: today } },
    include: {
      rooms: {
        include: {
          room: { select: { roomNumber: true } },
          updatedBy: { select: { name: true } },
        },
        orderBy: [{ priority: 'desc' }, { room: { roomNumber: 'asc' } }],
      },
    },
  })

  if (!plan) return NextResponse.json(null)

  return NextResponse.json({
    id: plan.id,
    date: plan.date.toISOString(),
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

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) {
    console.log('[clear-plan] unauthorized: missing session')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { password } = body
  if (!password) {
    console.log('[clear-plan] bad-request: missing password', {
      userId: (session.user as { id?: string }).id ?? null,
      hotelId: (session.user as { hotelId?: string }).hotelId ?? null,
    })
    return NextResponse.json({ error: 'Password required' }, { status: 400 })
  }

  const userId = parseInt((session.user as { id?: string }).id ?? '0')
  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')

  console.log('[clear-plan] request', {
    userId,
    hotelId,
  })

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } })
  if (!user) {
    console.log('[clear-plan] user-not-found', {
      userId,
      hotelId,
    })
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  console.log('[clear-plan] password-check', {
    userId,
    hotelId,
    valid,
  })
  if (!valid) return NextResponse.json({ error: 'Invalid password' }, { status: 403 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const plan = await prisma.dailyPlan.findUnique({
    where: { hotelId_date: { hotelId, date: today } },
    select: {
      id: true,
      rooms: {
        select: { id: true },
      },
    },
  })

  if (!plan) {
    console.log('[clear-plan] no-plan-found', {
      userId,
      hotelId,
      date: today.toISOString(),
    })
    return NextResponse.json({ ok: true })
  }

  const planRoomIds = plan.rooms.map((room) => room.id)

  await prisma.$transaction(async (tx) => {
    if (planRoomIds.length > 0) {
      await tx.statusHistory.deleteMany({
        where: { dailyPlanRoomId: { in: planRoomIds } },
      })
    }

    await tx.dailyPlanRoom.deleteMany({
      where: { dailyPlanId: plan.id },
    })

    await tx.dailyPlan.delete({
      where: { id: plan.id },
    })
  })

  console.log('[clear-plan] success', {
    userId,
    hotelId,
    date: today.toISOString(),
  })

  return NextResponse.json({ ok: true })
}
