import { createRoute, z } from '@hono/zod-openapi'

import { getUserByUsername } from '@/db'
import { generateAuthTokenAndSetCookie } from '@/lib/auth/auth-token'
import { verifyPassword } from '@/lib/auth/hash'
import {
  errorResponse,
  jsonContentRequired,
  jsonMessageContent,
} from '@/lib/helper'
import type { Context } from '@/types'

// Define the schema for the login request
const loginSchema = z.object({
  username: z.string().openapi({ example: 'username' }),
  password: z.string().openapi({ example: '123goodPassword' }),
})

// Define the route
const loginRoute = createRoute({
  tags: ['auth'],
  method: 'post',
  path: '/login',
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

const loginHandler = async (c: Context) => {
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
  await generateAuthTokenAndSetCookie(c, {
    user_id: user.user_id,
    username: user.username,
    user_role_id: user.user_role_id,
    created_at: user.created_at,
  })

  return c.json({ message: 'Login successful' }, 200)
}

export { loginHandler, loginRoute }
