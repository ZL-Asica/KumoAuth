import type { Context, ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { HTTPResponseError } from 'hono/types'

export const onError: ErrorHandler = (
  err: Error | HTTPResponseError,
  c: Context
) => {
  if (err instanceof HTTPException) {
    // If the error is an instance of HTTPException, return the error message
    return c.json({ error: err.message }, err.status)
  }
  return c.json({ error: 'Internal Server Error' }, 500)
}
