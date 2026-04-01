import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(1, 'Name required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  adminPassword: z.string().min(1, 'Admin password required'),
})

export function validateRegisterInput(input: unknown) {
  return registerSchema.safeParse(input)
}
