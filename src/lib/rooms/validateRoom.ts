import { z } from 'zod'

const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number required').max(10),
})

export function validateRoomInput(input: unknown) {
  return roomSchema.safeParse(input)
}
