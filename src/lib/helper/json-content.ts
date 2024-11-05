import type { ZodSchema } from '@/types'

export const jsonContent = <T extends ZodSchema>(
  schema: T,
  description: string
) => {
  return {
    content: {
      'application/json': {
        schema: schema,
      },
    },
    description: description,
  }
}
