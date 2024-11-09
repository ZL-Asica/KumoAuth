import { z } from '@hono/zod-openapi'

import { jsonContent } from './json-content'

export const errorResponse = (message: string) => {
  return jsonContent(
    z.object({
      error: z.string().openapi({ example: message }),
    }),
    message
  )
}
