import { getUserByUserId } from '@/db'
import { generateAuthTokenAndSetCookie } from '@/lib/auth/auth-token'
import { errorResponse } from '@/lib/helper'
import type { Context, MiddlewareHandler, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { jwt } from 'hono/jwt'

export const authMiddlewareSchema = {
  401: errorResponse('token verification failure'),
  404: errorResponse('User not found'),
  500: errorResponse('Failed to refresh token'),
}

export const authMiddleware: MiddlewareHandler = async (
  c: Context,
  next: Next
) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
    cookie: 'access_token',
  })

  await jwtMiddleware(c, async () => {
    const payload = c.get('jwtPayload')
    if (!payload || typeof payload.user_id !== 'number') {
      throw new HTTPException(401, { message: 'Token verification failure' })
    }

    const user = await getUserByUserId(c.env.DB, payload.user_id)
    if (!user) {
      throw new HTTPException(404, { message: 'User not found' })
    }

    const payloadToSign = {
      user_id: user.user_id,
      username: user.username,
      user_role_id: user.user_role_id,
      created_at: user.created_at,
    }

    await generateAuthTokenAndSetCookie(c, payloadToSign)

    c.set('user', payloadToSign)

    await next()
  })
}
