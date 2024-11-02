import { errorResponse, jsonContent } from '@/lib/helper'
import { validateAuthToken } from '@/utils/authToken'
import { createRoute, z } from '@hono/zod-openapi'
import type { Context } from 'hono'

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
    404: errorResponse('User not found'),
    500: errorResponse('Failed to generate JWT'),
  },
})

export const authStatusHandler = async (c: Context) => {
  const result = await validateAuthToken(c)

  if ('error' in result) {
    return c.json({ error: result.error }, result.status)
  }

  if (!result.username) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json(
    {
      user_id: result.user_id,
      username: result.username,
      user_role_id: result.user_role_id,
      created_at: result.created_at,
    },
    200
  )
}
