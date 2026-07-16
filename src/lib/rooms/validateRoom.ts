import { z } from 'zod'

const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number required').max(10),
})

export function validateRoomInput(input: unknown) {
  return roomSchema.safeParse(input)
}

export function parseRoomIdParam(id: string) {
  if (!/^\d+$/.test(id)) return null

  const roomId = Number(id)
  return Number.isSafeInteger(roomId) && roomId > 0 ? roomId : null
}
