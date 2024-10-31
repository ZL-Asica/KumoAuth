import { hashPassword } from '@/utils/hash'
import type { Context } from 'hono'

export const registerHandler = async (c: Context) => {
  const { username, password } = await c.req.json()

  console.info('Registering user:', username)

  // Hash the password
  const hashedPassword = await hashPassword(password)

  // Save the user to the database
  const db = c.env.DB // Cloudflare D1
  await db
    .prepare(
      'INSERT INTO users (username, password_hash, user_role) VALUES (?, ?, ?)'
    )
    .bind(username, hashedPassword, 'user')
    .run()

  return c.json({ message: 'User registered successfully' })
}
