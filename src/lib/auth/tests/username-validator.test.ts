import { usernameValidator } from '@/lib/auth/username-validator'
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

describe('usernameValidator', () => {
  it('should pass with a valid username', async () => {
    mockDB.first.mockResolvedValueOnce(null) // Username is not taken

    const result = await usernameValidator(mockContext, 'valid_user')

    expect(result).toBe(null)
  })

  it('should fail if username is already taken', async () => {
    mockDB.first.mockResolvedValueOnce({ id: 1 }) // Username exists in DB

    const result = await usernameValidator(mockContext, 'taken_user')

    expect(result).toBe('Username taken_user is already taken')
  })

  it('should fail if username contains bad words', async () => {
    mockDB.first.mockResolvedValueOnce(null) // Username is not taken

    const result = await usernameValidator(mockContext, 'fuck_user')

    expect(result).toBe('Username cannot contain bad words')
  })

  it('should fail if username contains risky words', async () => {
    mockDB.first.mockResolvedValueOnce(null) // Username is not taken

    const result = await usernameValidator(mockContext, 'adminUser')

    expect(result).toBe('Username cannot contain the word adminUser')
  })

  it('should fail if username contains reserved system words', async () => {
    mockDB.first.mockResolvedValueOnce(null) // Username is not taken

    const result = await usernameValidator(mockContext, 'system')

    expect(result).toBe('Username cannot contain the word system')
  })

  it('should fail if username is too short', async () => {
    mockDB.first.mockResolvedValueOnce(null) // Username is not taken

    const result = await usernameValidator(mockContext, 'usr')

    expect(result).toBe('Username must be at least 5 characters long')
  })

  it('should fail if username is too long', async () => {
    mockDB.first.mockResolvedValueOnce(null) // Username is not taken

    const result = await usernameValidator(
      mockContext,
      'this_username_is_too_long_to_be_valid'
    )

    expect(result).toBe('Username must not exceed 20 characters')
  })

  it('should fail if username contains disallowed special characters', async () => {
    mockDB.first.mockResolvedValueOnce(null) // Username is not taken

    const result = await usernameValidator(mockContext, 'user@name')

    expect(result).toMatch(
      /^Username can only contain alphanumeric characters and/
    )
  })

  it('should pass if username contains only allowed special characters', async () => {
    mockDB.first.mockResolvedValueOnce(null) // Username is not taken

    const result = await usernameValidator(mockContext, 'user-name')

    expect(result).toBe(null)
  })
})
