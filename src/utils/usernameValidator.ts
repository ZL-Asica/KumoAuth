import type { Context } from 'hono'

interface UsernamePatternInterface {
  minLength: number
  maxLength: number
  charsAllowed: RegExp[]
}

const usernamePattern: UsernamePatternInterface = {
  minLength: 5,
  maxLength: 20,
  charsAllowed: [
    /^[a-z]$/, // Lowercase letters
    /^[A-Z]$/, // Uppercase letters
    /^[0-9]$/, // Numbers
    /^[._-]$/, // Special characters(only . _ -)
  ],
}

export const usernameValidator = async (c: Context, username: string) => {
  const db = c.env.DB // Cloudflare D1

  // Check if username is already taken
  const existingUser = await db
    .prepare(`SELECT id FROM users WHERE username = ?`)
    .bind(username)
    .get()

  if (existingUser) {
    return `Username ${username} is already taken`
  }

  // Check if username meets the minimum length requirement
  if (username.length < usernamePattern.minLength) {
    return `Username must be at least ${usernamePattern.minLength} characters long`
  }

  // Check if username exceeds the maximum length requirement
  if (username.length > usernamePattern.maxLength) {
    return `Username must not exceed ${usernamePattern.maxLength} characters`
  }

  // Check if every character in the username is allowed
  const allowedSpecialCharactersDescription = '. _ -'
  for (const char of username) {
    if (!usernamePattern.charsAllowed.some((pattern) => pattern.test(char))) {
      return `Username can only contain alphanumeric characters and ${allowedSpecialCharactersDescription}`
    }
  }

  return null // Username is valid
}
