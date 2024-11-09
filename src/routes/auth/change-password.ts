import { createRoute, z } from '@hono/zod-openapi'

import { getUserPasswordByUserId, setUserPasswordByUserId } from '@/db'
import { passwordValidator } from '@/lib/auth/password-validator'
import {
  errorResponse,
  jsonContentRequired,
  jsonMessageContent,
} from '@/lib/helper'
import { authMiddleware, authMiddlewareSchema } from '@/middleware/auth'
import type { Context } from '@/types'

// Define the schema for the change password request
const changePasswordSchema = z.object({
  currentPassword: z.string().openapi({ example: '123badPassword' }),
  newPassword: z.string().openapi({ example: '123goodPassword' }),
})

// Define the route
const changePasswordRoute = createRoute({
  tags: ['auth'],
  method: 'put',
  path: '/change-password',
  middleware: [authMiddleware],
  request: {
    body: jsonContentRequired(changePasswordSchema, 'Change password request'),
  },
  responses: {
    ...authMiddlewareSchema,
    200: jsonMessageContent('Password changed successfully'),
    400: errorResponse('New password does not meet the requirements'),
    401: errorResponse('Invalid current password'),
    500: errorResponse('Failed to update password'),
  },
})

const changePasswordHandler = async (c: Context) => {
  const { currentPassword, newPassword } = await c.req.json()
  const user_id = c.get('jwtPayload').user_id

  // Check if the current password is correct
  const currentPasswordInDB = await getUserPasswordByUserId(c.env.DB, user_id)

  if (currentPasswordInDB !== currentPassword) {
    return c.json({ error: 'Invalid current password' }, 401)
  }

  // Use password validator to check if the new password is strong enough
  const validationResult = await passwordValidator(c, newPassword)
  if (validationResult) {
    return c.json({ error: validationResult }, 400)
  }

  // Update the password
  const changePasswordResult = await setUserPasswordByUserId(
    c.env.DB,
    user_id,
    newPassword
  )

  if (!changePasswordResult) {
    return c.json({ error: 'Failed to update password' }, 500)
  }

  return c.json({ message: 'Password changed successfully' }, 200)
}

export { changePasswordHandler, changePasswordRoute }
