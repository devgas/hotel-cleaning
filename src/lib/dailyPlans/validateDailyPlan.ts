import { z } from 'zod'
import { isValidPriorityTime } from '@/lib/dailyPlans/priorityTime'

const planRoomSchema = z.object({
  roomId: z.number().int().positive(),
  roomType: z.enum(['checkout', 'stayover']),
  priority: z.boolean(),
  priorityTime: z.string().nullable().optional(),
}).superRefine((value, ctx) => {
  if (!value.priority) return

  if (!isValidPriorityTime(value.priorityTime)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['priorityTime'],
      message: 'Priority time must be between 09:00 and 23:00',
    })
  }
})

const dailyPlanSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  rooms: z.array(planRoomSchema).min(1, 'At least one room required'),
})

export function validateDailyPlanInput(input: unknown) {
  return dailyPlanSchema.safeParse(input)
}
