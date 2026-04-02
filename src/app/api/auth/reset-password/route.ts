import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { validateResetPasswordInput } from '@/lib/auth/validateResetPassword'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = validateResetPasswordInput(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { name, newPassword, adminPassword } = parsed.data
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

  const user = await prisma.user.findFirst({
    where: { hotelId, name },
    select: { id: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  })

  return NextResponse.json({ ok: true })
}
