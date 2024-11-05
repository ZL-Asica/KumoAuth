import { errorHook } from '@/lib/helper'
import { OpenAPIHono } from '@hono/zod-openapi'
import { changePasswordHandler, changePasswordRoute } from './change-password'
import { loginHandler, loginRoute } from './login'
import { logoutHandler, logoutRoute } from './logout'
import { registerHandler, registerRoute } from './register'
import { authStatusHandler, authStatusRoute } from './status'

const auth = new OpenAPIHono()
  .openapi(registerRoute, registerHandler, errorHook)
  .openapi(loginRoute, loginHandler, errorHook)
  .openapi(authStatusRoute, authStatusHandler, errorHook)
  .openapi(logoutRoute, logoutHandler, errorHook)
  .openapi(changePasswordRoute, changePasswordHandler, errorHook)

export default auth
