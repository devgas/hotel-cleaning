import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')

  const plans = await prisma.dailyPlan.findMany({
    where: { hotelId },
    orderBy: { date: 'desc' },
    take: 30,
    include: { rooms: { select: { status: true } } },
  })

  return NextResponse.json(plans.map((p) => ({
    date: p.date.toISOString().split('T')[0],
    total: p.rooms.length,
    cleaned: p.rooms.filter((r) => r.status === 'cleaned').length,
    notNeeded: p.rooms.filter((r) => r.status === 'not_needed').length,
    notCleaned: p.rooms.filter((r) => r.status === 'not_cleaned_yet').length,
  })))
}
