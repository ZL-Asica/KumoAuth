import type { Context } from 'hono'
import { setSignedCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'

// Generate JWT token and set it as a cookie
export const generateAuthTokenAndSetCookie = async (
  c: Context,
  user_id: number,
  user_role_id: number
): Promise<void | { error: string }> => {
  try {
    const exp =
      Math.floor(Date.now() / 1000) +
      (parseInt(c.env.JWT_EXPIRE_IN) || 30) * 24 * 60 * 60

    const payload = {
      user_id,
      user_role_id,
      exp: exp,
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
    return { error: 'Failed to generate JWT' }
  }
}
