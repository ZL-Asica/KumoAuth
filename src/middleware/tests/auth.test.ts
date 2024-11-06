import { generateAuthTokenAndSetCookie } from '@/lib/auth/auth-token'
import { authMiddleware } from '@/middleware/auth'
import type { Context, User } from '@/types'
import { HTTPException } from 'hono/http-exception'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies
vi.mock('@/lib/auth/auth-token')

// Mock the JWT middleware to directly set a payload
vi.mock('hono/jwt', () => ({
  jwt: () => async (c: Context, next: () => Promise<void>) => {
    // Directly set the payload in the context
    c.set('jwtPayload', { user_id: 1, raw: 'mockRawToken' })
    await next()
  },
}))

const mockDB = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  first: vi.fn(),
}

// Mock Context and Next function
const mockContext = {
  env: { JWT_SECRET: 'testSecret', DB: mockDB },
  get: vi.fn(),
  set: vi.fn(),
  json: vi.fn(),
} as unknown as Context

const next = vi.fn()

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should authenticate and set user details in context', async () => {
    // Set up mock JWT payload and user data
    mockContext.get = vi.fn().mockImplementation((key) => {
      if (key === 'jwtPayload') return { user_id: 1, raw: 'mockRawToken' }
      return undefined
    }) // Ensure `jwtPayload` is set
    const mockUser = {
      user_id: 1,
      username: 'testUser',
      user_role_id: 2,
      created_at: '2021-07-01T00:00:00.000Z',
    } as User

    mockDB.first.mockResolvedValueOnce(mockUser) // User found in DB
    vi.mocked(generateAuthTokenAndSetCookie).mockResolvedValueOnce() // Mock token generation

    await authMiddleware(mockContext, next)

    // Ensure the user was fetched and set in context
    expect(mockContext.set).toHaveBeenCalledWith('user', mockUser)
    // Ensure `next` was called to continue the request
    expect(next).toHaveBeenCalled()
  })

  it('should throw 401 if JWT payload is invalid', async () => {
    // Simulate missing or invalid JWT payload
    mockContext.get = vi.fn().mockReturnValueOnce(null)

    await expect(authMiddleware(mockContext, next)).rejects.toThrowError(
      new HTTPException(401, { message: 'Token verification failure' })
    )
  })

  it('should throw 404 if user is not found', async () => {
    mockContext.get = vi.fn().mockImplementation((key) => {
      if (key === 'jwtPayload') return { user_id: 1, raw: 'mockRawToken' }
      return undefined
      // User not found in DB
    }) // Valid JWT payload with raw
    mockDB.first.mockResolvedValueOnce(null)

    await expect(authMiddleware(mockContext, next)).rejects.toThrowError(
      new HTTPException(404, { message: 'User not found' })
    )
  })

  it('should throw 500 if token generation fails', async () => {
    mockContext.get = vi.fn().mockImplementation((key) => {
      if (key === 'jwtPayload') return { user_id: 1, raw: 'mockRawToken' }
      return undefined
    }) // Valid JWT payload with raw
    const mockUser = {
      user_id: 1,
      username: 'testUser',
      user_role_id: 2,
      created_at: '2021-07-01T00:00:00.000Z',
    } as User
    mockDB.first.mockResolvedValueOnce(mockUser) // User found in DB
    vi.mocked(generateAuthTokenAndSetCookie).mockRejectedValueOnce(
      new HTTPException(500, { message: 'Failed to refresh token' })
    )

    await expect(authMiddleware(mockContext, next)).rejects.toThrowError(
      new HTTPException(500, { message: 'Failed to refresh token' })
    )
  })
})
