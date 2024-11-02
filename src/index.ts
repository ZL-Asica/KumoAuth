import { loginHandler, loginRoute } from '@/auth/login'
import { registerHandler, registerRoute } from '@/auth/register'
import { errorHook } from '@/lib/helper'
import { OpenAPIHono } from '@hono/zod-openapi'
import { apiReference } from '@scalar/hono-api-reference'
import type { Context } from 'hono'
import { authStatusHandler, authStatusRoute } from './auth/status'

type Bindings = {
  JWT_SECRET: string
  JWT_EXPIRE_IN: string
}

const app = new OpenAPIHono<{ Bindings: Bindings }>()

// Home route
app.get('/', (c: Context) => {
  return c.text('Hello Hono!')
})

// Login route
app.openapi(loginRoute, loginHandler, errorHook)

// Register route
app.openapi(registerRoute, registerHandler, errorHook)

// Auth Status route
app.openapi(authStatusRoute, authStatusHandler, errorHook)

// Set OpenAPI documentation
app.doc31('/doc', {
  openapi: '3.1.0',
  info: {
    title: 'KumoAuth API',
    version: '1.0.0',
  },
})

// Interactive API reference
app.get(
  '/reference',
  apiReference({
    pageTitle: 'KumoAuth API Reference',
    favicon: 'https://zla.app/favicon.ico',
    metaData: {
      title: 'KumoAuth API Reference',
      description: 'API reference for KumoAuth',
      ogDescription: 'API reference for KumoAuth',
      ogTitle: 'KumoAuth API Reference',
    },
    theme: 'kepler',
    hideModels: true,
    spec: {
      url: '/doc',
    },
  })
)

export default app
