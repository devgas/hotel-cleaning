import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hotel = await prisma.hotel.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'My Hotel' },
  })

  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123'
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12)

  await prisma.appSetting.upsert({
    where: { hotelId_key: { hotelId: hotel.id, key: 'admin_password_hash' } },
    update: { value: adminPasswordHash },
    create: { hotelId: hotel.id, key: 'admin_password_hash', value: adminPasswordHash },
  })

  await prisma.appSetting.upsert({
    where: { hotelId_key: { hotelId: hotel.id, key: 'default_language' } },
    update: {},
    create: { hotelId: hotel.id, key: 'default_language', value: 'uk' },
  })

  await prisma.appSetting.upsert({
    where: { hotelId_key: { hotelId: hotel.id, key: 'whatsapp_enabled' } },
    update: {},
    create: { hotelId: hotel.id, key: 'whatsapp_enabled', value: 'false' },
  })

  await prisma.appSetting.upsert({
    where: { hotelId_key: { hotelId: hotel.id, key: 'whatsapp_phone' } },
    update: {},
    create: { hotelId: hotel.id, key: 'whatsapp_phone', value: '' },
  })

  await prisma.appSetting.upsert({
    where: { hotelId_key: { hotelId: hotel.id, key: 'whatsapp_message_template' } },
    update: {},
    create: { hotelId: hotel.id, key: 'whatsapp_message_template', value: 'Кімната {room} прибрана' },
  })

  for (let i = 101; i <= 110; i++) {
    await prisma.room.upsert({
      where: { hotelId_roomNumber: { hotelId: hotel.id, roomNumber: String(i) } },
      update: {},
      create: { hotelId: hotel.id, roomNumber: String(i) },
    })
  }

  console.log(`Seed complete. Admin password: ${adminPassword}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
