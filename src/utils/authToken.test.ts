import { getUserByUserId } from '@/lib/db'
import {
  generateAuthTokenAndSetCookie,
  validateAuthToken,
} from '@/utils/authToken'
import type { Context } from 'hono'
import { getSignedCookie, setSignedCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies
vi.mock('hono/cookie')
vi.mock('hono/jwt')
vi.mock('@/lib/db')

// Mock Context
const mockContext = {
  env: { JWT_SECRET: 'testSecret', JWT_EXPIRE_IN: '30' },
  req: { json: vi.fn() },
  json: vi.fn(),
  header: vi.fn(),
} as unknown as Context

describe('generateAuthTokenAndSetCookie', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should generate a JWT and set it as a signed cookie', async () => {
    const mockToken = 'mocked.jwt.token'
    vi.mocked(sign).mockResolvedValueOnce(mockToken)
    vi.mocked(setSignedCookie).mockResolvedValueOnce(undefined)

    await generateAuthTokenAndSetCookie(mockContext, 1, 1)

    const expectedPayload = {
      user_id: 1,
      user_role_id: 1,
      exp: expect.any(Number),
    }
    expect(sign).toHaveBeenCalledWith(
      expectedPayload,
      mockContext.env.JWT_SECRET
    )

    expect(setSignedCookie).toHaveBeenCalledWith(
      mockContext,
      'access_token',
      mockToken,
      mockContext.env.JWT_SECRET,
      {
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: 'Strict',
        maxAge: expect.any(Number),
        expires: expect.any(Date),
      }
    )
  })

  it('should return an error if JWT generation fails', async () => {
    vi.mocked(sign).mockRejectedValueOnce(new Error('Failed to sign JWT'))

    const result = await generateAuthTokenAndSetCookie(mockContext, 1, 1)

    expect(result).toEqual({ error: 'Failed to generate JWT' })
    expect(setSignedCookie).not.toHaveBeenCalled()
  })

  it('should return an error if setting the cookie fails', async () => {
    const mockToken = 'mocked.jwt.token'
    vi.mocked(sign).mockResolvedValueOnce(mockToken)
    vi.mocked(setSignedCookie).mockRejectedValueOnce(
      new Error('Failed to set cookie')
    )

    const result = await generateAuthTokenAndSetCookie(mockContext, 1, 1)

    expect(result).toEqual({ error: 'Failed to generate JWT' })
    expect(sign).toHaveBeenCalled()
    expect(setSignedCookie).toHaveBeenCalledWith(
      mockContext,
      'access_token',
      mockToken,
      mockContext.env.JWT_SECRET,
      expect.any(Object)
    )
  })
})

describe('validateAuthToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if token is missing', async () => {
    vi.mocked(getSignedCookie).mockResolvedValueOnce(undefined)

    const result = await validateAuthToken(mockContext)

    expect(result).toEqual({ status: 401, error: 'Not logged in' })
  })

  it('should return 403 if token is invalid', async () => {
    vi.mocked(getSignedCookie).mockResolvedValueOnce('invalid.token')
    vi.mocked(verify).mockRejectedValueOnce(new Error('Invalid token'))

    const result = await validateAuthToken(mockContext)

    expect(result).toEqual({ status: 403, error: 'Invalid token' })
  })

  it('should return 401 if token is expired', async () => {
    vi.mocked(getSignedCookie).mockResolvedValueOnce('expired.token')
    vi.mocked(verify).mockRejectedValueOnce(new Error('TokenExpiredError'))

    const result = await validateAuthToken(mockContext)

    expect(result).toEqual({ status: 401, error: 'Token expired' })
  })

  it('should return 404 if user is not found', async () => {
    vi.mocked(getSignedCookie).mockResolvedValueOnce('valid.token')
    vi.mocked(verify).mockResolvedValueOnce({ user_id: 999 })
    vi.mocked(getUserByUserId).mockResolvedValueOnce(null)

    const result = await validateAuthToken(mockContext)

    expect(result).toEqual({ status: 404, error: 'User not found' })
  })

  it('should return 500 if token refresh fails', async () => {
    const mockUser = {
      user_id: 1,
      username: 'testUser',
      user_role_id: 1,
      password_hash: 'testHash',
      created_at: '2023-11-01T12:00:00Z',
    }
    vi.mocked(getSignedCookie).mockResolvedValueOnce('valid.token')
    vi.mocked(verify).mockResolvedValueOnce({ user_id: 1 })
    vi.mocked(getUserByUserId).mockResolvedValueOnce(mockUser)
    vi.mocked(setSignedCookie).mockRejectedValueOnce(
      new Error('Failed to set cookie')
    )

    const result = await validateAuthToken(mockContext)

    expect(result).toEqual({ status: 500, error: 'Failed to refresh token' })
  })

  it('should return user if token is valid and user exists', async () => {
    const mockUser = {
      user_id: 1,
      username: 'testUser',
      user_role_id: 1,
      password_hash: 'testHash',
      created_at: '2023-11-01T12:00:00Z',
    }
    vi.mocked(getSignedCookie).mockResolvedValueOnce('valid.token')
    vi.mocked(verify).mockResolvedValueOnce({ user_id: 1 })
    vi.mocked(getUserByUserId).mockResolvedValueOnce(mockUser)
    vi.mocked(setSignedCookie).mockResolvedValueOnce(undefined)

    const result = await validateAuthToken(mockContext)

    expect(result).toEqual({
      user_id: 1,
      username: 'testUser',
      user_role_id: 1,
      created_at: '2023-11-01T12:00:00Z',
    })
  })
})
