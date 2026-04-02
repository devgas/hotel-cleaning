import { z } from 'zod'

const resetPasswordSchema = z.object({
  name: z.string().min(1, 'Name required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  adminPassword: z.string().min(1, 'Admin password required'),
})

export function validateResetPasswordInput(input: unknown) {
  return resetPasswordSchema.safeParse(input)
}
