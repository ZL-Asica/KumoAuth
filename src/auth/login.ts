import { getUserByUsername } from '@/lib/db'
import { errorResponse, jsonContent, jsonContentRequired } from '@/lib/helper'
import { verifyPassword } from '@/utils/hash'
import { generateJWT } from '@/utils/jwt'
import { createRoute, z } from '@hono/zod-openapi'
import type { Context } from 'hono'

// Define the schema for the login request
const loginSchema = z.object({
  username: z.string().openapi({ example: 'username' }),
  password: z.string().openapi({ example: '123goodPassword' }),
})

// Define the response schemas for the login route
const loginSuccessResponseSchema = z.object({
  token: z
    .string()
    .openapi({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' }),
})

// Define the route
export const loginRoute = createRoute({
  method: 'post',
  path: '/auth/login',
  request: {
    body: jsonContentRequired(loginSchema, 'Login request'),
  },
  responses: {
    200: jsonContent(loginSuccessResponseSchema, 'Login successful'),
    404: errorResponse('User not found'),
    401: errorResponse('Invalid password'),
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

  // Generate a JWT token
  const token = await generateJWT(c, {
    userID: user.user_id,
    userRole: user.user_role_id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
  })

  return c.json({ token }, 200)
}
