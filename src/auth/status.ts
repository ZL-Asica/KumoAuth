import { errorResponse, jsonMessageContent } from '@/lib/helper'
import { createRoute } from '@hono/zod-openapi'
import type { Context } from 'hono'
import { getSignedCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'

// authStatusRoute
export const authStatusRoute = createRoute({
  method: 'get',
  path: '/auth/status',
  responses: {
    200: jsonMessageContent('Logged in'),
    401: errorResponse('Not logged in or token expired'),
    403: errorResponse('Invalid token or token verification failed'),
  },
})

export const authStatusHandler = async (c: Context) => {
  const token = await getSignedCookie(c, c.env.JWT_SECRET, 'access_token')

  if (!token) {
    return c.json({ error: 'Not logged in' }, 401)
  }

  try {
    await verify(token, c.env.JWT_SECRET)
    return c.json({ message: 'Logged in' }, 200)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'TokenExpiredError') {
        return c.json({ error: 'Token expired' }, 401)
      }
      return c.json({ error: 'Invalid token' }, 403)
    }
    return c.json({ error: 'Token verification failed' }, 403)
  }
}
