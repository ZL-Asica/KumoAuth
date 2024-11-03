import { passwordValidator } from '@/utils/password-validator'
import type { Context } from 'hono'
import { describe, expect, it, vi } from 'vitest'

// Mock database preparation function
const mockDB = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  first: vi.fn(),
}

// Mock context
const mockContext = {
  env: {
    DB: mockDB,
  },
} as unknown as Context

describe('passwordValidator', () => {
  // Mock password rule for testing
  const passwordRule = {
    min_length: 8,
    min_type: 3,
    require_special: true,
    require_upper: true,
    require_number: true,
  }

  it('should pass with a valid password', async () => {
    mockDB.first.mockResolvedValueOnce(passwordRule)

    const result = await passwordValidator(mockContext, 'Password1!')

    expect(result).toBe(null)
  })

  it('should fail if password is too short', async () => {
    mockDB.first.mockResolvedValueOnce(passwordRule)

    const result = await passwordValidator(mockContext, 'Pass1!')

    expect(result).toBe('Password must be at least 8 characters long')
  })

  it('should fail if missing uppercase letter', async () => {
    mockDB.first.mockResolvedValueOnce(passwordRule)

    const result = await passwordValidator(mockContext, 'password1!')

    expect(result).toBe('Password must contain at least one uppercase letter')
  })

  it('should fail if missing number', async () => {
    mockDB.first.mockResolvedValueOnce(passwordRule)

    const result = await passwordValidator(mockContext, 'Password!')

    expect(result).toBe('Password must contain at least one number')
  })

  it('should fail if missing special character', async () => {
    mockDB.first.mockResolvedValueOnce(passwordRule)

    const result = await passwordValidator(mockContext, 'Password1')

    expect(result).toBe('Password must contain at least one special character')
  })

  it('should fail if not enough character types', async () => {
    const customRule = {
      ...passwordRule,
      min_type: 4, // Require all types
      require_special: false,
    }
    mockDB.first.mockResolvedValueOnce(customRule)

    const result = await passwordValidator(mockContext, 'Password1')

    expect(result).toBe(
      'Password must contain at least 4 different types of characters'
    )
  })
})
