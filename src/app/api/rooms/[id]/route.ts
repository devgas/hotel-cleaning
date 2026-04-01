import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
import { validateRoomInput } from '@/lib/rooms/validateRoom'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = validateRoomInput(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { id } = await params
  const room = await prisma.room.update({
    where: { id: parseInt(id) },
    data: { roomNumber: parsed.data.roomNumber },
    select: { id: true, roomNumber: true },
  })

  return NextResponse.json(room)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.room.update({
    where: { id: parseInt(id) },
    data: { isActive: false },
  })

  return NextResponse.json({ ok: true })
}
