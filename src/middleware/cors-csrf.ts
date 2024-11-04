import type { Context, MiddlewareHandler } from 'hono'
import { cors } from 'hono/cors'
import { csrf } from 'hono/csrf'

// Combined CORS and CSRF middleware handler
export const corsCsrfMiddlewareHandler: MiddlewareHandler = async (
  c: Context,
  next
) => {
  // Parse origins from environment variable or use wildcard
  const origins =
    c.env.CORS_CSRF_ORIGIN?.split(',').map((s: string) => s.trim()) || '*'

  // Initialize CORS and CSRF middleware with the same origins
  const corsMiddlewareHandler = cors({ origin: origins })
  const csrfMiddlewareHandler = csrf({ origin: origins })

  // First apply CORS, then CSRF protection
  await corsMiddlewareHandler(c, async () => {
    await csrfMiddlewareHandler(c, next)
  })
}
