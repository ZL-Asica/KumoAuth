import { errorHook } from '@/lib/helper'
import { OpenAPIHono } from '@hono/zod-openapi'
import { loginHandler, loginRoute } from './login'
import { registerHandler, registerRoute } from './register'
import { authStatusHandler, authStatusRoute } from './status'

const auth = new OpenAPIHono()
  .openapi(registerRoute, registerHandler, errorHook)
  .openapi(loginRoute, loginHandler, errorHook)
  .openapi(authStatusRoute, authStatusHandler, errorHook)

export default auth