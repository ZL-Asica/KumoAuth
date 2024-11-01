import { z } from '@hono/zod-openapi'
import { jsonContent } from './jsonContent'

export const errorResponse = (message: string) => {
  return jsonContent(
    z.object({
      error: z.string().openapi({ example: message }),
    }),
    message
  )
}
