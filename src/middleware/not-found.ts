import type { Context, NotFoundHandler } from '@/types'

export const notFound: NotFoundHandler = (c: Context) => {
  return c.json({ error: `Not found - ${c.req.path}` }, 404)
}
