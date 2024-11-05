import type { DBType, User } from '@/types'

export const getUserByUsername = async (
  db: DBType,
  username: string
): Promise<User | undefined | null> => {
  return await db
    .prepare('SELECT * FROM users WHERE username = ?')
    .bind(username)
    .first()
}

export const getUserByUserId = async (
  db: DBType,
  user_id: number
): Promise<User | undefined | null> => {
  return await db
    .prepare('SELECT * FROM users WHERE user_id = ?')
    .bind(user_id)
    .first()
}
