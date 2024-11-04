import { generateAuthTokenAndSetCookie } from '@/utils/auth-token'
import type { Context } from 'hono'
import { setSignedCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { sign } from 'hono/jwt'
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

    await generateAuthTokenAndSetCookie(mockContext, {
      user_id: 1,
      username: 'testUser',
      user_role_id: 1,
      created_at: '2021-01-01T00:00:00.000Z',
    })

    const expectedPayload = {
      user_id: 1,
      username: 'testUser',
      user_role_id: 1,
      created_at: '2021-01-01T00:00:00.000Z',
      exp: expect.any(Number),
      nbf: expect.any(Number),
      iat: expect.any(Number),
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

  it('should throw HTTPException if JWT generation fails', async () => {
    vi.mocked(sign).mockRejectedValueOnce(new Error('Failed to sign JWT'))

    await expect(
      generateAuthTokenAndSetCookie(mockContext, {
        user_id: 1,
        username: 'testUser',
        user_role_id: 1,
        created_at: '2021-01-01T00:00:00.000Z',
      })
    ).rejects.toThrow(HTTPException)

    expect(setSignedCookie).not.toHaveBeenCalled()
  })

  it('should throw HTTPException if setting the cookie fails', async () => {
    const mockToken = 'mocked.jwt.token'
    vi.mocked(sign).mockResolvedValueOnce(mockToken)
    vi.mocked(setSignedCookie).mockRejectedValueOnce(
      new Error('Failed to set cookie')
    )

    await expect(
      generateAuthTokenAndSetCookie(mockContext, {
        user_id: 1,
        username: 'testUser',
        user_role_id: 1,
        created_at: '2021-01-01T00:00:00.000Z',
      })
    ).rejects.toThrow(HTTPException)

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
