import { securityMiddlewareHandler } from '@/middleware/security'
import type { Context } from '@/types'
import { cors } from 'hono/cors'
import { csrf } from 'hono/csrf'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock CORS and CSRF middlewares
vi.mock('hono/cors')
vi.mock('hono/csrf')

// Mock Context and Next function
const mockContext = {
  env: { CORS_CSRF_ORIGIN: 'https://example.com, https://another.com' },
  set: vi.fn(),
  json: vi.fn(),
} as unknown as Context

const next = vi.fn()

describe('securityMiddlewareHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should apply CORS and CSRF middleware with specific origins', async () => {
    // Mock CORS and CSRF middleware handlers to just call next
    const corsHandler = vi.fn(async (c, next) => await next())
    const csrfHandler = vi.fn(async (c, next) => await next())

    vi.mocked(cors).mockReturnValueOnce(corsHandler)
    vi.mocked(csrf).mockReturnValueOnce(csrfHandler)

    await securityMiddlewareHandler(mockContext, next)

    // Check if CORS and CSRF were initialized with the correct origins
    const expectedOrigins = ['https://example.com', 'https://another.com']
    expect(cors).toHaveBeenCalledWith({ origin: expectedOrigins })
    expect(csrf).toHaveBeenCalledWith({ origin: expectedOrigins })

    // Verify that cors and csrf handlers were called
    expect(corsHandler).toHaveBeenCalled()
    expect(csrfHandler).toHaveBeenCalled()

    // Ensure the request proceeded to the next middleware
    expect(next).toHaveBeenCalled()
  })

  it('should apply CORS and CSRF middleware with wildcard origin if no origins are specified', async () => {
    // Set up context without a specified origin
    mockContext.env.CORS_CSRF_ORIGIN = undefined

    const corsHandler = vi.fn(async (c, next) => await next())
    const csrfHandler = vi.fn(async (c, next) => await next())

    vi.mocked(cors).mockReturnValueOnce(corsHandler)
    vi.mocked(csrf).mockReturnValueOnce(csrfHandler)

    await securityMiddlewareHandler(mockContext, next)

    // Check if CORS and CSRF were initialized with wildcard origin
    expect(cors).toHaveBeenCalledWith({ origin: '*' })
    expect(csrf).toHaveBeenCalledWith({ origin: '*' })

    // Verify that cors and csrf handlers were called
    expect(corsHandler).toHaveBeenCalled()
    expect(csrfHandler).toHaveBeenCalled()

    // Ensure the request proceeded to the next middleware
    expect(next).toHaveBeenCalled()
  })
})
