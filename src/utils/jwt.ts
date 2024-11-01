import type { Context } from 'hono'
import { sign } from 'hono/jwt'

// generate a JWT token
export const generateJWT = async (
  c: Context,
  user_id: number,
  user_role_id: number
) => {
  const exp =
    Math.floor(Date.now() / 1000) + parseInt(c.env.JWT_EXPIRE_IN) * 24 * 60 * 60
  const payload = {
    user_id,
    user_role_id,
    exp: exp,
  }
  const token = await sign(payload, c.env.JWT_SECRET)
  return { token, exp }
}
