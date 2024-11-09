import type { Context } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies
import { generateAuthTokenAndSetCookie } from '@/lib/auth/auth-token'
import { hashPassword } from '@/lib/auth/hash'
import { passwordValidator } from '@/lib/auth/password-validator'
import { usernameValidator } from '@/lib/auth/username-validator'
import { registerHandler } from '@/routes/auth/register'

// Mock implementations
vi.mock('@/lib/auth/hash')
vi.mock('@/lib/auth/auth-token')
vi.mock('@/lib/auth/password-validator')
vi.mock('@/lib/auth/username-validator')

// Mock database
const mockDB = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  run: vi.fn(),
  first: vi.fn(),
}

// Mock Context
const mockContext = {
  env: { DB: mockDB, JWT_SECRET: 'testSecret' },
  req: { json: vi.fn().mockResolvedValueOnce({}) },
  json: vi.fn(),
  header: vi.fn(),
} as unknown as Context

describe('registerHandler', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  it('should register a user and return a JWT token', async () => {
    // Set up mocks
    mockContext.req.json = vi.fn().mockResolvedValueOnce({
      username: 'newUser',
      password: 'ValidPassword123!',
    })
    vi.mocked(usernameValidator).mockResolvedValueOnce(null) // Valid username
    vi.mocked(passwordValidator).mockResolvedValueOnce(null) // Valid password
    vi.mocked(hashPassword).mockResolvedValueOnce('hashedPassword')
    mockDB.run.mockResolvedValueOnce({ meta: { last_row_id: 1 } })
    mockDB.first.mockResolvedValueOnce({
      user_id: 1,
      username: 'newUser',
      user_role_id: 1,
    })

    vi.mocked(generateAuthTokenAndSetCookie).mockResolvedValueOnce()

    // Call handler
    await registerHandler(mockContext)

    // Check assertions
    expect(mockDB.prepare).toHaveBeenCalledWith(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)'
    )
    expect(mockDB.bind).toHaveBeenCalledWith('newUser', 'hashedPassword')

    // Check if the user was inserted into the database
    expect(mockDB.prepare).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE user_id = ?'
    )
    expect(mockDB.bind).toHaveBeenCalledWith(1)

    expect(mockContext.json).toHaveBeenCalledWith(
      {
        user_id: 1,
        username: 'newUser',
        user_role_id: 1,
      },
      201
    )
  })

  it('should return an error if username validation fails', async () => {
    mockContext.req.json = vi.fn().mockResolvedValueOnce({
      username: 'badUser',
      password: 'ValidPassword123!',
    })
    vi.mocked(usernameValidator).mockResolvedValueOnce('Invalid username')

    await registerHandler(mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Invalid username' },
      400
    )
  })

  it('should return an error if password validation fails', async () => {
    mockContext.req.json = vi.fn().mockResolvedValueOnce({
      username: 'newUser',
      password: 'badPass',
    })
    vi.mocked(usernameValidator).mockResolvedValueOnce(null)
    vi.mocked(passwordValidator).mockResolvedValueOnce('Invalid password')

    await registerHandler(mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Invalid password' },
      400
    )
  })
})
