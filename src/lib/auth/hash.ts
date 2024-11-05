import bcrypt from 'bcryptjs'

// Hash password
export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10) // Generate a salt with 10 rounds
  return bcrypt.hash(password, salt)
}

// Verify password
export const verifyPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash)
}
