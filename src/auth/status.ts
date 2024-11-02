import { getUserByUserId } from '@/lib/db'
import { errorResponse, jsonContent } from '@/lib/helper'
import { generateJWTAndSetCookie } from '@/utils/jwt'
import { createRoute, z } from '@hono/zod-openapi'
import type { Context } from 'hono'
import { getSignedCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'

const authStatusSchema = z.object({
  user_id: z.number(),
  username: z.string(),
  user_role_id: z.number(),
  created_at: z.string(),
})

export const authStatusRoute = createRoute({
  method: 'get',
  path: '/auth/status',
  responses: {
    200: jsonContent(authStatusSchema, 'User details'),
    401: errorResponse('Token expired'),
    403: errorResponse('Invalid token'),
    500: errorResponse('Failed to generate JWT'),
  },
})

export const authStatusHandler = async (c: Context) => {
  const token = await getSignedCookie(c, c.env.JWT_SECRET, 'access_token')

  if (!token) {
    return c.json({ error: 'Not logged in' }, 401)
  }

  try {
    const decoded = await verify(token, c.env.JWT_SECRET)

    if (!decoded || typeof decoded.user_id !== 'number') {
      return c.json({ error: 'Invalid token' }, 403)
    }

    const user = await getUserByUserId(c.env.DB, decoded.user_id)

    if (!user) {
      return c.json({ error: 'User not found' }, 403)
    }

    // Generate a JWT token and set it as a cookie
    const catchError = await generateJWTAndSetCookie(
      c,
      user.user_id,
      user.user_role_id
    )

    if (catchError) {
      return c.json(catchError, 500)
    }

    return c.json(
      {
        user_id: user.user_id,
        username: user.username,
        user_role_id: user.user_role_id,
        created_at: user.created_at,
      },
      200
    )
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
