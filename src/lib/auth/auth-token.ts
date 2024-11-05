import type { Context } from '@/types'
import { setSignedCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { sign } from 'hono/jwt'

interface PayloadToSignInterface {
  user_id: number
  username: string
  user_role_id: number
  created_at: string
}

// Generate JWT token and set it as a cookie
export const generateAuthTokenAndSetCookie = async (
  c: Context,
  payloadToSign: PayloadToSignInterface
): Promise<void | { error: string }> => {
  try {
    const exp =
      Math.floor(Date.now() / 1000) +
      (parseInt(c.env.JWT_EXPIRE_IN) || 30) * 24 * 60 * 60

    const nbf = Math.floor(Date.now() / 1000) - 24 * 60 * 60
    const iat = Math.floor(Date.now() / 1000) - 24 * 60 * 60

    const payload = {
      ...payloadToSign,
      exp: exp,
      nbf: nbf,
      iat: iat,
    }

    const token = await sign(payload, c.env.JWT_SECRET)

    await setSignedCookie(c, 'access_token', token, c.env.JWT_SECRET, {
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: exp - Math.floor(Date.now() / 1000),
      expires: new Date(exp * 1000),
    })
  } catch {
    throw new HTTPException(500, { message: 'Failed to refresh token' })
  }
}
