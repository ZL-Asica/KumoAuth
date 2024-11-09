import type { DBType, UserQueryResult } from '@/types'

export const createNewUser = async (
  database: DBType,
  username: string,
  hashedPassword: string
): Promise<UserQueryResult | undefined | null> => {
  return await database
    .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    .bind(username, hashedPassword)
    .run()
}
