import type { Context, ErrorHandler } from 'hono'
import type { HTTPResponseError } from 'hono/types'

export const onError: ErrorHandler = (
  err: Error | HTTPResponseError,
  c: Context
) => {
  console.error(`Error: ${err}`)
  return c.json({ error: 'Internal Server Error' }, 500)
}
