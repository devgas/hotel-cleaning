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
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { adminPassword } = body
  if (!adminPassword) return NextResponse.json({ error: 'Admin password required' }, { status: 400 })

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')

  const hashRow = await prisma.appSetting.findUnique({
    where: { hotelId_key: { hotelId, key: 'admin_password_hash' } },
  })
  if (!hashRow) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const valid = await bcrypt.compare(adminPassword, hashRow.value)
  if (!valid) return NextResponse.json({ error: 'Invalid admin password' }, { status: 403 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.dailyPlan.deleteMany({
    where: { hotelId, date: today },
  })

  return NextResponse.json({ ok: true })
}
