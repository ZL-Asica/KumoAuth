import { logoutHandler } from '@/routes/auth/logout'
import type { Context } from '@/types'
import { deleteCookie } from 'hono/cookie'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock Context
const mockContext = {
  json: vi.fn(),
  set: vi.fn(),
} as unknown as Context

vi.mock('hono/cookie')

describe('logoutHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully log out the user', () => {
    // Call the handler
    logoutHandler(mockContext)

    // Check that deleteCookie was called with the correct parameters
    expect(deleteCookie).toHaveBeenCalledWith(mockContext, 'access_token', {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    })

    // Check that the response was sent with a 200 status
    expect(mockContext.json).toHaveBeenCalledWith(
      { message: 'Logged out' },
      200
    )
  })

  it('should return an error if logout fails', () => {
    // Force deleteCookie to throw an error
    vi.mocked(deleteCookie).mockImplementationOnce(() => {
      throw new Error('Logout error')
    })

    // Call the handler
    logoutHandler(mockContext)

    // Check that the response was sent with a 500 status and error message
    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Logout error' },
      500
    )
  })
})
