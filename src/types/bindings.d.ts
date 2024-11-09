import type { JwtVariables } from 'hono/jwt'

type Bindings = {
  JWT_SECRET: string
  JWT_EXPIRE_IN: string
  CORS_CSRF_ORIGIN: string
}

type Variables = JwtVariables

export type { Bindings, Variables }
