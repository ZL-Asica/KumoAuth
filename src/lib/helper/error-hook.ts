import type { Context, ZodError } from '@/types'

export const errorHook = (
  result: { success: boolean; error?: ZodError },
  c: Context
) => {
  if (!result.success && result.error) {
    const message = result.error.message || 'Internal Server Error'

    return c.json({ error: message }, 500)
  }
}
