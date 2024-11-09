import type { Context } from '@/types'

const verifyHandler = async (c: Context) => {
  return c.json({ message: 'Verify handler' }, 200)
}

export { verifyHandler }
