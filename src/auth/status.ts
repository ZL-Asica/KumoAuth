import { jsonContent } from '@/lib/helper'
import { authMiddleware, authMiddlewareSchema } from '@/middleware/auth'
import { createRoute, z } from '@hono/zod-openapi'
import type { Context } from 'hono'

const authStatusSchema = z.object({
  user_id: z.number(),
  username: z.string(),
  user_role_id: z.number(),
  created_at: z.string(),
})

export const authStatusRoute = createRoute({
  tags: ['auth'],
  method: 'get',
  path: '/status',
  middleware: [authMiddleware],
  responses: {
    ...authMiddlewareSchema,
    200: jsonContent(authStatusSchema, 'User details'),
  },
})

export const authStatusHandler = (c: Context) => {
  return c.json(c.get('user'), 200)
}
