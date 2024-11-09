import { OpenAPIHono } from '@hono/zod-openapi'
import { apiReference } from '@scalar/hono-api-reference'

import { notFound } from '@/middleware/not-found'
import { onError } from '@/middleware/on-error'
import { securityMiddlewareHandler } from '@/middleware/security'
import { workerLogger } from '@/middleware/worker-logger'
import auth from '@/routes/auth'
import type { Bindings, Context, Variables } from '@/types'

const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

// Add worker logger middleware to all routes
app.use(workerLogger)

// Home route
app.get('/', (c: Context) => {
  return c.text('Hello Hono!')
})

// Not found route
app.notFound(notFound)

// On error
app.onError(onError)

// CORS and CSRF middleware
app.use(securityMiddlewareHandler)

// Auth routes
app.route('/auth', auth)

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
