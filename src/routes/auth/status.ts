import { createRoute, z } from '@hono/zod-openapi'

import { jsonContent } from '@/lib/helper'
import { authMiddleware, authMiddlewareSchema } from '@/middleware/auth'
import type { Context } from '@/types'

const authStatusSchema = z.object({
  user_id: z.number(),
  username: z.string(),
  user_role_id: z.number(),
  created_at: z.string(),
})

const authStatusRoute = createRoute({
  tags: ['auth'],
  method: 'get',
  path: '/status',
  middleware: [authMiddleware],
  responses: {
    ...authMiddlewareSchema,
    200: jsonContent(authStatusSchema, 'User details'),
  },
})

const authStatusHandler = (c: Context) => {
  return c.json(c.get('user'), 200)
}

export { authStatusHandler, authStatusRoute }
