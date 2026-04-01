import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { validateRegisterInput } from '@/lib/auth/validateRegister'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = validateRegisterInput(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { name, password, adminPassword } = parsed.data
  const hotelId = parseInt(process.env.NEXT_PUBLIC_DEFAULT_HOTEL_ID ?? '1')

  const setting = await prisma.appSetting.findUnique({
    where: { hotelId_key: { hotelId, key: 'admin_password_hash' } },
  })

  if (!setting) {
    return NextResponse.json({ error: 'Hotel not configured' }, { status: 500 })
  }

  const adminValid = await bcrypt.compare(adminPassword, setting.value)
  if (!adminValid) {
    return NextResponse.json({ error: 'Invalid admin password' }, { status: 403 })
  }

  const existing = await prisma.user.findFirst({ where: { hotelId, name } })
  if (existing) {
    return NextResponse.json({ error: 'Name already taken' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { hotelId, name, passwordHash },
    select: { id: true, name: true },
  })

  return NextResponse.json(user, { status: 201 })
}
