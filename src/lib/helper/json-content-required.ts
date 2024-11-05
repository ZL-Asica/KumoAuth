import type { ZodSchema } from '@/types'
import { jsonContent } from './json-content'

export const jsonContentRequired = <T extends ZodSchema>(
  schema: T,
  description: string
) => ({
  ...jsonContent<T>(schema, description),
  required: true,
})
