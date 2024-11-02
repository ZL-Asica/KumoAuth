import { authStatusHandler } from '@/auth/status'
import type { Context } from 'hono'
import { getSignedCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies
vi.mock('hono/cookie')
vi.mock('hono/jwt')

// Mock Context
const mockContext = {
  env: { JWT_SECRET: 'testSecret' },
  req: { json: vi.fn() },
  json: vi.fn(),
  header: vi.fn(),
} as unknown as Context

describe('authStatusHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 200 if user is logged in', async () => {
    // Mock a valid token
    vi.mocked(getSignedCookie).mockResolvedValueOnce('valid.token')
    vi.mocked(verify).mockResolvedValueOnce({ user_id: 1 })

    await authStatusHandler(mockContext)

    expect(verify).toHaveBeenCalledWith(
      'valid.token',
      mockContext.env.JWT_SECRET
    )
    expect(mockContext.json).toHaveBeenCalledWith({ message: 'Logged in' }, 200)
  })

  it('should return 401 if user is not logged in (no token)', async () => {
    // Mock no token
    vi.mocked(getSignedCookie).mockResolvedValueOnce(undefined)

    await authStatusHandler(mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Not logged in' },
      401
    )
  })

  it('should return 401 if token is expired', async () => {
    // Mock expired token
    vi.mocked(getSignedCookie).mockResolvedValueOnce('expired.token')
    vi.mocked(verify).mockRejectedValueOnce(new Error('TokenExpiredError'))

    await authStatusHandler(mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Token expired' },
      401
    )
  })

  it('should return 403 if token is invalid', async () => {
    // Mock invalid token
    vi.mocked(getSignedCookie).mockResolvedValueOnce('invalid.token')
    vi.mocked(verify).mockRejectedValueOnce(new Error('Invalid token'))

    await authStatusHandler(mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Invalid token' },
      403
    )
  })
})
