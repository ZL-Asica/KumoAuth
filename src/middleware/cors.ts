import type { Context, MiddlewareHandler } from 'hono'
import { cors } from 'hono/cors'

export const corsMiddlewareHandler: MiddlewareHandler = async (
  c: Context,
  next
) => {
  const corsMiddlewareHandler = cors({
    origin: c.env.CORS_ORIGIN?.split(',').map((s: string) => s.trim()) || '*',
  })
  return corsMiddlewareHandler(c, next)
}
