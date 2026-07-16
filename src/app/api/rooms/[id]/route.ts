import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
import { parseRoomIdParam, validateRoomInput } from '@/lib/rooms/validateRoom'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')
  const { id } = await params
  const roomId = parseRoomIdParam(id)
  if (!roomId) return NextResponse.json({ error: 'Invalid room id' }, { status: 400 })

  const body = await req.json()
  const parsed = validateRoomInput(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const result = await prisma.room.updateMany({
    where: { id: roomId, hotelId },
    data: { roomNumber: parsed.data.roomNumber },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  return NextResponse.json({ id: roomId, roomNumber: parsed.data.roomNumber })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')
  const { id } = await params
  const roomId = parseRoomIdParam(id)
  if (!roomId) return NextResponse.json({ error: 'Invalid room id' }, { status: 400 })

  const result = await prisma.room.updateMany({
    where: { id: roomId, hotelId },
    data: { isActive: false },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
