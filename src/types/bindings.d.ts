import type { JwtVariables } from 'hono/jwt'

export type Bindings = {
  JWT_SECRET: string
  JWT_EXPIRE_IN: string
  CORS_CSRF_ORIGIN: string
}

export type Variables = JwtVariables
