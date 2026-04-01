import { describe, it, expect } from 'vitest'
import { validateRegisterInput } from '@/lib/auth/validateRegister'

describe('validateRegisterInput', () => {
  it('rejects missing name', () => {
    const result = validateRegisterInput({ name: '', password: 'pass123', adminPassword: 'admin123' })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = validateRegisterInput({ name: 'Ana', password: '123', adminPassword: 'admin123' })
    expect(result.success).toBe(false)
  })

  it('accepts valid input', () => {
    const result = validateRegisterInput({ name: 'Ana', password: 'password1', adminPassword: 'admin123' })
    expect(result.success).toBe(true)
  })
})
