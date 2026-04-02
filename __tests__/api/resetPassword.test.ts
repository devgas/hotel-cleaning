import { describe, it, expect } from 'vitest'
import { validateResetPasswordInput } from '@/lib/auth/validateResetPassword'

describe('validateResetPasswordInput', () => {
  it('rejects missing name', () => {
    expect(validateResetPasswordInput({ name: '', newPassword: 'pass123', adminPassword: 'admin123' }).success).toBe(false)
  })

  it('rejects short password', () => {
    expect(validateResetPasswordInput({ name: 'Ana', newPassword: '123', adminPassword: 'admin123' }).success).toBe(false)
  })

  it('accepts valid input', () => {
    expect(validateResetPasswordInput({ name: 'Ana', newPassword: 'password1', adminPassword: 'admin123' }).success).toBe(true)
  })
})
