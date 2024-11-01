import type { DBType, UserQueryResult } from './types'

export const createNewUser = async (
  db: DBType,
  username: string,
  hashedPassword: string
): Promise<UserQueryResult | undefined | null> => {
  return await db
    .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    .bind(username, hashedPassword)
    .run()
}
