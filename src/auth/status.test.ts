import { authStatusHandler } from '@/auth/status'
import { getUserByUserId } from '@/lib/db'
import type { Context } from 'hono'
import { getSignedCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies
vi.mock('hono/cookie')
vi.mock('hono/jwt')
vi.mock('@/lib/db')

// Mock Context
const mockContext = {
  env: { JWT_SECRET: 'testSecret', DB: 'testDB' },
  req: { json: vi.fn() },
  json: vi.fn(),
  header: vi.fn(),
} as unknown as Context

describe('authStatusHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 200 with user details if user is logged in', async () => {
    vi.mocked(getSignedCookie).mockResolvedValueOnce('valid.token')
    vi.mocked(verify).mockResolvedValueOnce({
      user_id: 1,
      user_role_id: 1,
      exp: 1234567890,
    })
    vi.mocked(getUserByUserId).mockResolvedValueOnce({
      user_id: 1,
      username: 'testUser',
      user_role_id: 1,
      password_hash: 'testHash',
      created_at: '2023-11-01T12:00:00Z',
    })

    await authStatusHandler(mockContext)

    expect(verify).toHaveBeenCalledWith(
      'valid.token',
      mockContext.env.JWT_SECRET
    )
    expect(getUserByUserId).toHaveBeenCalledWith(mockContext.env.DB, 1)
    expect(mockContext.json).toHaveBeenCalledWith(
      {
        user_id: 1,
        username: 'testUser',
        user_role_id: 1,
        created_at: '2023-11-01T12:00:00Z',
      },
      200
    )
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

  it('should return 403 Token verification failed when a non-Error is thrown', async () => {
    // Mock error
    vi.mocked(getSignedCookie).mockResolvedValueOnce('invalid.token.test')
    vi.mocked(verify).mockRejectedValueOnce('Token verification failed')

    await authStatusHandler(mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Token verification failed' },
      403
    )
  })
})
