import { validateAuthToken } from '@/utils/auth-token'
import type { Context, Next } from 'hono'
import { createMiddleware } from 'hono/factory'

export const authMiddleware = createMiddleware(
  async (c: Context, next: Next) => {
    const result = await validateAuthToken(c)

    if ('error' in result) {
      return c.json({ error: result.error }, result.status)
    }

    // If validation is successful, carry the user's profile to context
    c.set('user', {
      user_id: result.user_id,
      username: result.username,
      user_role_id: result.user_role_id,
      created_at: result.created_at,
    })

    await next()
  }
)
