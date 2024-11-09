import { beforeEach, describe, expect, it, vi } from 'vitest'

import { authStatusHandler } from '@/routes/auth/status'
import type { Context } from '@/types'

// Mock Context
const mockContext = {
  get: vi.fn(),
  json: vi.fn(),
} as unknown as Context

describe('authStatusHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return the user details', () => {
    // Mock user data
    const mockUser = {
      user_id: 1,
      username: 'testUser',
      user_role_id: 2,
      created_at: '2021-07-01T00:00:00.000Z',
    }
    mockContext.get = vi.fn().mockReturnValueOnce(mockUser)

    // Call handler
    authStatusHandler(mockContext)

    // Check that the response contains the correct user data with a 200 status
    expect(mockContext.json).toHaveBeenCalledWith(mockUser, 200)
  })
})
