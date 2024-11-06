import { getUserPasswordByUserId, setUserPasswordByUserId } from '@/db'
import { passwordValidator } from '@/lib/auth/password-validator'
import { changePasswordHandler } from '@/routes/auth/change-password'
import type { Context } from '@/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock implementations
vi.mock('@/lib/auth/password-validator')
vi.mock('@/db')

// Mock Context
const mockContext = {
  env: { DB: {} },
  req: { json: vi.fn() },
  json: vi.fn(),
  get: vi.fn(),
} as unknown as Context

describe('changePasswordHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully change the password', async () => {
    // Mock request data and database behavior
    mockContext.req.json = vi.fn().mockResolvedValueOnce({
      currentPassword: 'oldPassword123',
      newPassword: 'newValidPassword123!',
    })
    mockContext.get = vi.fn().mockReturnValueOnce({ user_id: 1 })

    // Mock successful current password check and password update
    vi.mocked(getUserPasswordByUserId).mockResolvedValueOnce('oldPassword123')
    vi.mocked(passwordValidator).mockResolvedValueOnce(null) // Valid new password
    vi.mocked(setUserPasswordByUserId).mockResolvedValueOnce(true) // Password update successful

    await changePasswordHandler(mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      { message: 'Password changed successfully' },
      200
    )
  })

  it('should return an error if the current password is incorrect', async () => {
    mockContext.req.json = vi.fn().mockResolvedValueOnce({
      currentPassword: 'wrongPassword',
      newPassword: 'newValidPassword123!',
    })
    mockContext.get = vi.fn().mockReturnValueOnce({ user_id: 1 })
    vi.mocked(getUserPasswordByUserId).mockResolvedValueOnce('oldPassword123') // Current password mismatch

    await changePasswordHandler(mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Invalid current password' },
      401
    )
  })

  it('should return an error if the new password is invalid', async () => {
    mockContext.req.json = vi.fn().mockResolvedValueOnce({
      currentPassword: 'oldPassword123',
      newPassword: 'weak',
    })
    mockContext.get = vi.fn().mockReturnValueOnce({ user_id: 1 })
    vi.mocked(getUserPasswordByUserId).mockResolvedValueOnce('oldPassword123')
    vi.mocked(passwordValidator).mockResolvedValueOnce('Invalid new password') // New password validation failed

    await changePasswordHandler(mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Invalid new password' },
      400
    )
  })

  it('should return an error if password update fails', async () => {
    mockContext.req.json = vi.fn().mockResolvedValueOnce({
      currentPassword: 'oldPassword123',
      newPassword: 'newValidPassword123!',
    })
    mockContext.get = vi.fn().mockReturnValueOnce({ user_id: 1 })
    vi.mocked(getUserPasswordByUserId).mockResolvedValueOnce('oldPassword123')
    vi.mocked(passwordValidator).mockResolvedValueOnce(null)
    vi.mocked(setUserPasswordByUserId).mockResolvedValueOnce(false) // Password update failed

    await changePasswordHandler(mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Failed to update password' },
      500
    )
  })
})
