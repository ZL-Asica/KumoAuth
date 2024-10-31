import type { Context } from 'hono'

export const passwordValidator = async (
  c: Context,
  password: string,
  userRoleId: number = 1
) => {
  const db = c.env.DB // Cloudflare D1
  const passwordRule = await db
    .prepare(
      `SELECT min_length, min_type, require_special, require_upper, require_number
       FROM PasswordRules
       JOIN UserRoles ON UserRoles.password_rule_id = PasswordRules.id
       WHERE UserRoles.id = ?`
    )
    .bind(userRoleId)
    .first()

  if (!passwordRule) {
    throw new Error(`Password rule not found for user role: ${userRoleId}`)
  }

  // Check if password meets the minimum length requirement
  if (password.length < passwordRule.min_length) {
    return `Password must be at least ${passwordRule.min_length} characters long`
  }

  const typeChecks = [
    { regex: /[a-z]/, required: false, message: 'lowercase letter' },
    {
      regex: /[A-Z]/,
      required: passwordRule.require_upper,
      message: 'uppercase letter',
    },
    {
      regex: /[0-9]/,
      required: passwordRule.require_number,
      message: 'number',
    },
    {
      regex: /[!@#$%^&*(),.?":{}|<>]/,
      required: passwordRule.require_special,
      message: 'special character',
    },
  ]

  // Check total type or required type lost
  let typeCount = 0
  for (const check of typeChecks) {
    if (check.regex.test(password)) {
      typeCount++
    } else if (check.required) {
      return `Password must contain at least one ${check.message}`
    }
  }

  // Check if password meets the minimum type requirement
  if (typeCount < passwordRule.min_type) {
    return `Password must contain at least ${passwordRule.min_type} different types of characters`
  }

  return null // Password is valid
}
