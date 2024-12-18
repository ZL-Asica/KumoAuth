import type { Context } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies
import { getUserByUsername } from '@/db'
import { generateAuthTokenAndSetCookie } from '@/lib/auth/auth-token'
import { verifyPassword } from '@/lib/auth/hash'
import { loginHandler } from '@/routes/auth/login'

// Mock implementations
vi.mock('@/db')
vi.mock('@/lib/auth/hash')
vi.mock('@/lib/auth/auth-token')

// Mock database and environment
const mockDB = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  first: vi.fn(),
}

// Mock Context
const mockContext = {
  env: {
    DB: mockDB,
    JWT_SECRET: 'testSecret',
  },
  req: { json: vi.fn() },
  json: vi.fn(),
  header: vi.fn(),
} as unknown as Context

describe('loginHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should log in a user and return a JWT token', async () => {
    // Mock request data
    mockContext.req.json = vi.fn().mockResolvedValueOnce({
      username: 'existingUser',
      password: 'ValidPassword123!',
    })

    // Mock user data and JWT generation
    vi.mocked(getUserByUsername).mockResolvedValueOnce({
      user_id: 1,
      username: 'existingUser',
      password_hash: 'hashedPassword',
      user_role_id: 1,
      created_at: new Date().toUTCString(),
    })
    vi.mocked(verifyPassword).mockResolvedValueOnce(true) // Password valid
    vi.mocked(generateAuthTokenAndSetCookie).mockResolvedValueOnce()

    // Call handler
    await loginHandler(mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      { message: 'Login successful' },
      200
    )
  })

  it('should return 404 if user is not found', async () => {
    mockContext.req.json = vi.fn().mockResolvedValueOnce({
      username: 'nonExistingUser',
      password: 'ValidPassword123!',
    })

    // Mock user not found
    vi.mocked(getUserByUsername).mockResolvedValueOnce(null)

    await loginHandler(mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'User not found' },
      404
    )
  })

  it('should return 401 if password is incorrect', async () => {
    mockContext.req.json = vi.fn().mockResolvedValueOnce({
      username: 'existingUser',
      password: 'InvalidPassword!',
    })

    // Mock user data and invalid password
    vi.mocked(getUserByUsername).mockResolvedValueOnce({
      user_id: 1,
      username: 'existingUser',
      password_hash: 'hashedPassword',
      user_role_id: 1,
      created_at: new Date().toUTCString(),
    })
    vi.mocked(verifyPassword).mockResolvedValueOnce(false) // Password invalid

    await loginHandler(mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Invalid password' },
      401
    )
  })
})
