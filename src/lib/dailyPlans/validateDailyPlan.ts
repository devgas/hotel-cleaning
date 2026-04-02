import { z } from 'zod'

const planRoomSchema = z.object({
  roomId: z.number().int().positive(),
  roomType: z.enum(['checkout', 'stayover']),
  priority: z.boolean(),
})

const dailyPlanSchema = z.object({
  rooms: z.array(planRoomSchema).min(1, 'At least one room required'),
})

export function validateDailyPlanInput(input: unknown) {
  return dailyPlanSchema.safeParse(input)
}
