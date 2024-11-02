import { createNewUser, getUserByUserId } from '@/lib/db'
import { errorResponse, jsonContentRequired } from '@/lib/helper'
import { generateAuthTokenAndSetCookie } from '@/utils/authToken'
import { hashPassword } from '@/utils/hash'
import { passwordValidator } from '@/utils/passwordValidator'
import { usernameValidator } from '@/utils/usernameValidator'
import { createRoute, z } from '@hono/zod-openapi'
import type { Context } from 'hono'

// Define the schema for the register request
const registerSchema = z.object({
  username: z.string().min(3).max(20).openapi({ example: 'username' }),
  password: z.string().min(8).max(100).openapi({ example: '123goodPassword' }),
})

const registerSuccessResponseSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  username: z.string().openapi({ example: 'username' }),
  role: z.number().openapi({ example: 1 }),
})

export const registerRoute = createRoute({
  method: 'post',
  path: '/auth/register',
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

export const registerHandler = async (c: Context) => {
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
  const db = c.env.DB
  const result = await createNewUser(db, username, hashedPassword)

  if (!result || !result.meta.last_row_id) {
    return c.json({ error: 'User registration failed' }, 500)
  }

  const user = await getUserByUserId(db, result.meta.last_row_id)

  if (!user) {
    return c.json({ error: 'User retrieval failed' }, 500)
  }

  // Generate a JWT token and set it as a cookie
  const catchError = await generateAuthTokenAndSetCookie(
    c,
    user.user_id,
    user.user_role_id
  )

  if (catchError) {
    return c.json(catchError, 500)
  }

  return c.json(
    {
      id: user.user_id,
      username: user.username,
      role: user.user_role_id,
    },
    201
  )
}
