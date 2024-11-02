import { getUserByUsername } from '@/lib/db'
import {
  errorResponse,
  jsonContentRequired,
  jsonMessageContent,
} from '@/lib/helper'
import { verifyPassword } from '@/utils/hash'
import { generateJWTAndSetCookie } from '@/utils/jwt'
import { createRoute, z } from '@hono/zod-openapi'
import type { Context } from 'hono'

// Define the schema for the login request
const loginSchema = z.object({
  username: z.string().openapi({ example: 'username' }),
  password: z.string().openapi({ example: '123goodPassword' }),
})

// Define the route
export const loginRoute = createRoute({
  method: 'post',
  path: '/auth/login',
  request: {
    body: jsonContentRequired(loginSchema, 'Login request'),
  },
  responses: {
    200: jsonMessageContent('Login successful'),
    404: errorResponse('User not found'),
    401: errorResponse('Invalid password'),
    500: errorResponse('Failed to generate JWT'),
  },
})

export const loginHandler = async (c: Context) => {
  const { username, password } = await c.req.json()

  // Get the user from the database
  const user = await getUserByUsername(c.env.DB, username)

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  // Verify the password
  const isPasswordValid = await verifyPassword(password, user.password_hash)

  if (!isPasswordValid) {
    return c.json({ error: 'Invalid password' }, 401)
  }

  // Generate a JWT token and set it as a cookie
  const catchError = await generateJWTAndSetCookie(
    c,
    user.user_id,
    user.user_role_id
  )

  if (catchError) {
    return c.json(catchError, 500)
  }

  return c.json({ message: 'Login successful' }, 200)
}
