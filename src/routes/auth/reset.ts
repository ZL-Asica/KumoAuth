import type { Context } from '@/types'

const resetHandler = async (c: Context) => {
  return c.json({ message: 'Reset handler' }, 200)
}

export { resetHandler }
