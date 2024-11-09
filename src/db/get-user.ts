import type { DBType, User } from '@/types'

const getUserByUsername = async (
  database: DBType,
  username: string
): Promise<User | undefined | null> => {
  try {
    return await database
      .prepare('SELECT * FROM users WHERE username = ?')
      .bind(username)
      .first()
  } catch {
    return null
  }
}

const getUserByUserId = async (
  database: DBType,
  user_id: number
): Promise<User | undefined | null> => {
  try {
    return await database
      .prepare('SELECT * FROM users WHERE user_id = ?')
      .bind(user_id)
      .first()
  } catch {
    return null
  }
}

export { getUserByUserId, getUserByUsername }
