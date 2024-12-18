import { createRoute } from '@hono/zod-openapi'
import { deleteCookie } from 'hono/cookie'

import { errorResponse, jsonMessageContent } from '@/lib/helper'
import { authMiddleware, authMiddlewareSchema } from '@/middleware/auth'
import type { Context } from '@/types'

const logoutRoute = createRoute({
  tags: ['auth'],
  method: 'post',
  path: '/logout',
  middleware: [authMiddleware],
  responses: {
    ...authMiddlewareSchema,
    200: jsonMessageContent('Logged out'),
    500: errorResponse('Failed to log out'),
  },
})

const logoutHandler = (c: Context) => {
  try {
    deleteCookie(c, 'access_token', {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    })

    return c.json({ message: 'Logged out' }, 200)
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500)
    }
    return c.json({ error: 'Failed to log out' }, 500)
  }
}

export { logoutHandler, logoutRoute }
