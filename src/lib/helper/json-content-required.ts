import { jsonContent } from './json-content'

import type { ZodSchema } from '@/types'

export const jsonContentRequired = <T extends ZodSchema>(
  schema: T,
  description: string
) => ({
  ...jsonContent<T>(schema, description),
  required: true,
})
