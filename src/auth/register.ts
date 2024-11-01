import { hashPassword } from '@/utils/hash'
import { generateJWT } from '@/utils/jwt'
import { passwordValidator } from '@/utils/passwordValidator'
import { usernameValidator } from '@/utils/usernameValidator'
import type { Context } from 'hono'

export const registerHandler = async (c: Context) => {
  const { username, password } = await c.req.json()

  // Username validation
  const usernameError = await usernameValidator(c, username)
  if (usernameError) {
    return c.json({ error: usernameError }, { status: 400 })
  }

  // Password validation
  const validatorError = await passwordValidator(c, password)
  if (validatorError) {
    return c.json({ error: validatorError }, { status: 400 })
  }

  // Hash password and insert user into DB
  const hashedPassword = await hashPassword(password)
  const db = c.env.DB
  const result = await db
    .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    .bind(username, hashedPassword)
    .run()

  if (!result || !result.meta.last_row_id) {
    return c.json({ error: 'User registration failed' }, { status: 500 })
  }

  const user = await db
    .prepare('SELECT * FROM users WHERE user_id = ?')
    .bind(result.meta.last_row_id)
    .first()

  if (!user) {
    return c.json({ error: 'User retrieval failed' }, { status: 500 })
  }

  // Generate JWT
  const token = await generateJWT(c, {
    userID: user.user_id,
    userRole: user.user_role_id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  })

  return c.json(
    {
      id: user.user_id,
      username: user.username,
      role: user.user_role_id,
      token,
    },
    { status: 201 }
  )
}
