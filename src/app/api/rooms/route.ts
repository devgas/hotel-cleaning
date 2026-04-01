import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
import { validateRoomInput } from '@/lib/rooms/validateRoom'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')
  const rooms = await prisma.room.findMany({
    where: { hotelId, isActive: true },
    orderBy: { roomNumber: 'asc' },
    select: { id: true, roomNumber: true },
  })

  return NextResponse.json(rooms)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = validateRoomInput(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')

  const existing = await prisma.room.findUnique({
    where: { hotelId_roomNumber: { hotelId, roomNumber: parsed.data.roomNumber } },
  })

  if (existing && !existing.isActive) {
    const restored = await prisma.room.update({
      where: { id: existing.id },
      data: { isActive: true },
      select: { id: true, roomNumber: true },
    })
    return NextResponse.json(restored, { status: 201 })
  }

  if (existing) {
    return NextResponse.json({ error: 'Room already exists' }, { status: 409 })
  }

  const room = await prisma.room.create({
    data: { hotelId, roomNumber: parsed.data.roomNumber },
    select: { id: true, roomNumber: true },
  })

  return NextResponse.json(room, { status: 201 })
}
