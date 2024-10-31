import { verifyPassword } from '@/utils/hash'
import { generateJWT } from '@/utils/jwt'
import type { Context } from 'hono'

export const loginHandler = async (c: Context) => {
  const { username, password } = await c.req.json()

  // Get the user from the database
  const db = c.env.DB // Cloudflare D1
  const user = await db
    .prepare('SELECT * FROM users WHERE username = ?')
    .bind(username)
    .first()

  if (!user) {
    return c.json({ message: 'User not found' }, { status: 404 })
  }

  // Verify the password
  const isPasswordValid = await verifyPassword(password, user.password_hash)

  if (!isPasswordValid) {
    return c.json({ message: 'Invalid password' }, { status: 401 })
  }

  // Generate a JWT token
  const token = await generateJWT(c, {
    userID: user.user_id,
    userRole: user.user_role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
  })

  return c.json({ token })
}
