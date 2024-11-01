import type { Context } from 'hono'
import { sign, verify } from 'hono/jwt'

// load secret from environment variable
const JWT_SECRET = 'my-secret'

// generate a JWT token
export const generateJWT = async (
  c: Context,
  payload: Record<string, unknown>
) => {
  return await sign(payload, c.env.JWT_SECRET)
}

// verify a JWT token
export const verifyJWT = async (c: Context, token: string) => {
  try {
    return await verify(token, JWT_SECRET)
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return c.json(
        { error: 'Token expired', message: 'Please log in again' },
        { status: 401 }
      )
    }
    return c.json({ error: 'Invalid token' }, { status: 403 })
  }
}
