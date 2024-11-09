import { Filter } from 'bad-words'

import { getUserByUsername } from '@/db'
import type { Context, UsernamePatternInterface } from '@/types'

const usernamePattern: UsernamePatternInterface = {
  minLength: 5,
  maxLength: 20,
  charsAllowed: [
    /^[a-z]$/, // Lowercase letters
    /^[A-Z]$/, // Uppercase letters
    /^\d$/, // Numbers
    /^[._-]$/, // Special characters(only . _ -)
  ],
}

// Define risky and reserved system words
const riskyWords = [
  'admin',
  'root',
  'support',
  'moderator',
  'superuser',
  'contact',
  'god',
]
const reservedSystemWords = new Set([
  'system',
  'null',
  'undefined',
  'true',
  'false',
  'undefined',
])

// Create a filter instance
const filter = new Filter()

export const usernameValidator = async (c: Context, username: string) => {
  // Check if username is already taken
  const existingUser = await getUserByUsername(c.env.DB, username)

  if (existingUser) {
    return `Username ${username} is already taken`
  }

  //  Check if username contains risky words or reserved system words
  const lowercaseUsername = username.toLowerCase()
  if (
    riskyWords.some((word) => lowercaseUsername.includes(word)) ||
    reservedSystemWords.has(lowercaseUsername)
  ) {
    return `Username cannot contain the word ${username}`
  }

  // Check if username contains bad words
  if (filter.isProfane(username.split('_').join(' '))) {
    return 'Username cannot contain bad words'
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
