import { loginHandler, loginRoute } from '@/auth/login'
import { registerHandler, registerRoute } from '@/auth/register'
import { OpenAPIHono } from '@hono/zod-openapi'
import { apiReference } from '@scalar/hono-api-reference'
import type { Context } from 'hono'

const app = new OpenAPIHono()

// Home route
app.get('/', (c: Context) => {
  return c.text('Hello Hono!')
})

// Login route
app.openapi(loginRoute, loginHandler)

app.openapi(registerRoute, registerHandler)

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
