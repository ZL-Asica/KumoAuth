import { getUserByUserId } from '@/lib/db'
import type { Context } from 'hono'
import { getSignedCookie, setSignedCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'
import * as JwtErrors from 'hono/utils/jwt/types'
import type { ValidationResult } from './types'

// Generate JWT token and set it as a cookie
export const generateAuthTokenAndSetCookie = async (
  c: Context,
  user_id: number,
  user_role_id: number
): Promise<void | { error: string }> => {
  try {
    const exp =
      Math.floor(Date.now() / 1000) +
      (parseInt(c.env.JWT_EXPIRE_IN) || 30) * 24 * 60 * 60

    const nbf = Math.floor(Date.now() / 1000) - 24 * 60 * 60
    const iat = Math.floor(Date.now() / 1000) - 24 * 60 * 60

    const payload = {
      user_id,
      user_role_id,
      exp: exp,
      nbf: nbf,
      iat: iat,
    }

    const token = await sign(payload, c.env.JWT_SECRET)

    await setSignedCookie(c, 'access_token', token, c.env.JWT_SECRET, {
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: exp - Math.floor(Date.now() / 1000),
      expires: new Date(exp * 1000),
    })
  } catch {
    return { error: 'Failed to generate JWT' }
  }
}

// Verify cookie and return user's profile
// * If 'error' exists in result, handle as an error response
export const validateAuthToken = async (
  c: Context
): Promise<ValidationResult> => {
  const token = await getSignedCookie(c, c.env.JWT_SECRET, 'access_token')

  if (!token) {
    return { status: 401, error: 'Not logged in' }
  }

  try {
    const decoded = await verify(token, c.env.JWT_SECRET)

    if (!decoded || typeof decoded.user_id !== 'number') {
      return { status: 403, error: 'Invalid token' }
    }

    const user = await getUserByUserId(c.env.DB, decoded.user_id)

    if (!user) {
      return { status: 404, error: 'User not found' }
    }

    const catchError = await generateAuthTokenAndSetCookie(
      c,
      user.user_id,
      user.user_role_id
    )

    if (catchError) {
      return { status: 500, error: 'Failed to refresh token' }
    }

    return {
      user_id: user.user_id,
      username: user.username,
      user_role_id: user.user_role_id,
      created_at: user.created_at,
    }
  } catch (error) {
    if (error instanceof Error) {
      // Use the JwtErrors namespace to access each error type
      switch (error.constructor) {
        case JwtErrors.JwtTokenExpired:
          return { status: 401, error: 'Token expired' }
        case JwtErrors.JwtTokenInvalid:
          return { status: 403, error: 'Invalid token' }
        case JwtErrors.JwtTokenNotBefore:
          return { status: 403, error: 'Token not valid yet' }
        case JwtErrors.JwtTokenIssuedAt:
          return { status: 403, error: 'Incorrect token issue date' }
        case JwtErrors.JwtTokenSignatureMismatched:
          return { status: 403, error: 'Token signature mismatch' }
        case JwtErrors.JwtAlgorithmNotImplemented:
          return { status: 500, error: 'Algorithm not implemented' }
        default:
          return { status: 403, error: 'Token verification failed' }
      }
    }
    return { status: 403, error: 'Token verification failed' }
  }
}
