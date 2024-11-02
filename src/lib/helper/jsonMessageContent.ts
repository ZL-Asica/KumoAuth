import { z } from '@hono/zod-openapi'
import { jsonContent } from './jsonContent'

export const jsonMessageContent = (message: string) => {
  const messageSchema = z.object({
    message: z.string().openapi({ example: message }),
  })
  return jsonContent(messageSchema, message)
}
