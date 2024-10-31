import { hashPassword } from '@/utils/hash'
import { passwordValidator } from '@/utils/passwordValidator'
import type { Context } from 'hono'

export const registerHandler = async (c: Context) => {
  const { username, password } = await c.req.json()

  // Check if the password meets the required rules
  const validatorError = await passwordValidator(c, password)
  if (validatorError) {
    return c.json({ error: validatorError }, { status: 400 })
  }

  // Hash the password
  const hashedPassword = await hashPassword(password)

  // Save the user to the database
  const db = c.env.DB // Cloudflare D1
  await db
    .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    .bind(username, hashedPassword)
    .run()

  return c.json({ message: 'User registered successfully' })
}
