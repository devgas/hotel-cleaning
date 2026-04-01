import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hotel = await prisma.hotel.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'My Hotel' },
  })

  const adminPasswordHash = await bcrypt.hash('admin123', 12)

  await prisma.appSetting.upsert({
    where: { hotelId_key: { hotelId: hotel.id, key: 'admin_password_hash' } },
    update: {},
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

  console.log('Seed complete. Admin password: admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
