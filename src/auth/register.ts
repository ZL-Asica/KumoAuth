import { hashPassword } from '@/utils/hash'
import { generateJWT } from '@/utils/jwt'
import { passwordValidator } from '@/utils/passwordValidator'
import { usernameValidator } from '@/utils/usernameValidator'
import type { Context } from 'hono'

export const registerHandler = async (c: Context) => {
  const { username, password } = await c.req.json()

  // Check if the username meets the required rules
  const usernameError = await usernameValidator(c, username)
  if (usernameError) {
    return c.json({ error: usernameError }, { status: 400 })
  }

  // Check if the password meets the required rules
  const validatorError = await passwordValidator(c, password)
  if (validatorError) {
    return c.json({ error: validatorError }, { status: 400 })
  }

  // Hash the password
  const hashedPassword = await hashPassword(password)

  // Save the user to the database
  const db = c.env.DB // Cloudflare D1
  const result = await db
    .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    .bind(username, hashedPassword)
    .run()

  // Get the user from the database
  const user = await db
    .prepare('SELECT * FROM users WHERE username = ?')
    .bind(result.lastInsertRowId)
    .first()

  // Generate a JWT token
  const token = await generateJWT(c, {
    userID: user.user_id,
    userRole: user.user_role_id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
  })

  // Return the token
  return c.json({
    message: 'User registered successfully',
    data: {
      id: user.user_id,
      username: user.username,
      role: user.user_role_id,
      token,
    },
  })
}
