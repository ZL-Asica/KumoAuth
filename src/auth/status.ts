import { errorResponse, jsonContent } from '@/lib/helper'
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
  return c.json(c.get('user'), 200)
}
