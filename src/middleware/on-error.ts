import { HTTPException } from 'hono/http-exception'

import type { Context, ErrorHandler, HTTPResponseError } from '@/types'

export const onError: ErrorHandler = (
  error: Error | HTTPResponseError,
  c: Context
) => {
  if (error instanceof HTTPException) {
    // If the error is an instance of HTTPException, return the error message
    return c.json({ error: error.message }, error.status)
  }
  return c.json({ error: 'Internal Server Error' }, 500)
}
