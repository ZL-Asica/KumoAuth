import { createRoute, z } from '@hono/zod-openapi'

import { createNewUser, getUserByUserId } from '@/db'
import { generateAuthTokenAndSetCookie } from '@/lib/auth/auth-token'
import { hashPassword } from '@/lib/auth/hash'
import { passwordValidator } from '@/lib/auth/password-validator'
import { usernameValidator } from '@/lib/auth/username-validator'
import { errorResponse, jsonContentRequired } from '@/lib/helper'
import type { Context } from '@/types'

// Define the schema for the register request
const registerSchema = z.object({
  username: z.string().min(3).max(20).openapi({ example: 'username' }),
  password: z.string().min(8).max(100).openapi({ example: '123goodPassword' }),
})

const registerSuccessResponseSchema = z.object({
  user_id: z.number().openapi({ example: 1 }),
  username: z.string().openapi({ example: 'username' }),
  user_role_id: z.number().openapi({ example: 1 }),
  created_at: z.string().openapi({ example: '2021-07-01T00:00:00.000Z' }),
})

const registerRoute = createRoute({
  tags: ['auth'],
  method: 'post',
  path: '/register',
  request: {
    body: jsonContentRequired(registerSchema, 'Register request'),
  },
  responses: {
    201: jsonContentRequired(
      registerSuccessResponseSchema,
      'Register successful'
    ),
    400: errorResponse('Invalid username or password'),
    500: errorResponse('User registration failed'),
  },
})

const registerHandler = async (c: Context) => {
  const { username, password } = await c.req.json()

  // Username validation
  const usernameError = await usernameValidator(c, username)
  if (usernameError) {
    return c.json({ error: usernameError }, 400)
  }

  // Password validation
  const validatorError = await passwordValidator(c, password)
  if (validatorError) {
    return c.json({ error: validatorError }, 400)
  }

  // Hash password and insert user into DB
  const hashedPassword = await hashPassword(password)
  const database = c.env.DB
  const result = await createNewUser(database, username, hashedPassword)

  if (!result || !result.meta.last_row_id) {
    return c.json({ error: 'User registration failed' }, 500)
  }

  const user = await getUserByUserId(database, result.meta.last_row_id)

  if (!user) {
    return c.json({ error: 'User retrieval failed' }, 500)
  }

  // Generate a JWT token and set it as a cookie
  await generateAuthTokenAndSetCookie(c, {
    user_id: user.user_id,
    username: user.username,
    user_role_id: user.user_role_id,
    created_at: user.created_at,
  })

  return c.json(
    {
      user_id: user.user_id,
      username: user.username,
      user_role_id: user.user_role_id,
      created_at: user.created_at,
    },
    201
  )
}

export { registerHandler, registerRoute }
