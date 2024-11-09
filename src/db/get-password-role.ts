import type { DBType, PasswordRule } from '@/types'

export const getPasswordRoleByUserRoleId = async (
  database: DBType,
  userRoleId: number
): Promise<PasswordRule | undefined | null> => {
  try {
    return await database
      .prepare(
        `SELECT min_length, min_type, require_special, require_upper, require_number
         FROM PasswordRules
         JOIN UserRoles ON UserRoles.password_rule_id = PasswordRules.id
         WHERE UserRoles.id = ?`
      )
      .bind(userRoleId)
      .first()
  } catch {
    return null
  }
}
