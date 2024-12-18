import type { DBType, User } from '@/types'

const getUserPasswordByUserId = async (
  database: DBType,
  user_id: number
): Promise<string | null> => {
  try {
    const result = await database
      .prepare('SELECT * FROM users WHERE user_id = ?')
      .bind(user_id)
      .first()

    const user = result as User | null
    return user?.password_hash || null
  } catch {
    return null
  }
}

const setUserPasswordByUserId = async (
  database: DBType,
  user_id: number,
  password_hash: string
): Promise<boolean> => {
  try {
    await database
      .prepare('UPDATE users SET password_hash = ? WHERE user_id = ?')
      .bind(password_hash, user_id)
      .run()

    return true
  } catch {
    return false
  }
}

export { getUserPasswordByUserId, setUserPasswordByUserId }
