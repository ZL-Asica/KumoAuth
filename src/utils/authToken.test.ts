import { generateAuthTokenAndSetCookie } from '@/utils/authToken'
import type { Context } from 'hono'
import { setSignedCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('hono/cookie')
vi.mock('hono/jwt')

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
    // Mock sign and setSignedCookie functions
    const mockToken = 'mocked.jwt.token'
    vi.mocked(sign).mockResolvedValueOnce(mockToken)
    vi.mocked(setSignedCookie).mockResolvedValueOnce(undefined)

    await generateAuthTokenAndSetCookie(mockContext, 1, 1)

    // Ensure the token was generated with the correct payload
    const expectedPayload = {
      user_id: 1,
      user_role_id: 1,
      exp: expect.any(Number),
    }
    expect(sign).toHaveBeenCalledWith(
      expectedPayload,
      mockContext.env.JWT_SECRET
    )

    // Check if the cookie was set with the correct token and options
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
    // Mock sign function to throw an error
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
