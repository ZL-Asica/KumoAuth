import type { Context } from 'hono'
import { describe, expect, it, vi } from 'vitest'
import { usernameValidator } from './usernameValidator'

// Mock database preparation function
const mockDB = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  get: vi.fn(),
}

// Mock context
const mockContext = {
  env: {
    DB: mockDB,
  },
} as unknown as Context

describe('usernameValidator', () => {
  it('should pass with a valid username', async () => {
    mockDB.get.mockResolvedValueOnce(null) // Username is not taken

    const result = await usernameValidator(mockContext, 'valid_user')

    expect(result).toBe(null)
  })

  it('should fail if username is already taken', async () => {
    mockDB.get.mockResolvedValueOnce({ id: 1 }) // Username exists in DB

    const result = await usernameValidator(mockContext, 'taken_user')

    expect(result).toBe('Username taken_user is already taken')
  })

  it('should fail if username is too short', async () => {
    mockDB.get.mockResolvedValueOnce(null) // Username is not taken

    const result = await usernameValidator(mockContext, 'usr')

    expect(result).toBe('Username must be at least 5 characters long')
  })

  it('should fail if username is too long', async () => {
    mockDB.get.mockResolvedValueOnce(null) // Username is not taken

    const result = await usernameValidator(
      mockContext,
      'this_username_is_too_long_to_be_valid'
    )

    expect(result).toBe('Username must not exceed 20 characters')
  })

  it('should fail if username contains disallowed special characters', async () => {
    mockDB.get.mockResolvedValueOnce(null) // Username is not taken

    const result = await usernameValidator(mockContext, 'user@name')

    expect(result).toMatch(
      /^Username can only contain alphanumeric characters and/
    )
  })

  it('should pass if username contains only allowed special characters', async () => {
    mockDB.get.mockResolvedValueOnce(null) // Username is not taken

    const result = await usernameValidator(mockContext, 'user-name')

    expect(result).toBe(null)
  })
})
