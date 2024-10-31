import { loginHandler } from '@/auth/login'
import { registerHandler } from '@/auth/register'
import type { Context } from 'hono'
import { Hono } from 'hono'

const app = new Hono()

// Home route
app.get('/', (c: Context) => {
  return c.text('Hello Hono!')
})

// Login route
app.post('auth/login', loginHandler)

app.post('auth/register', registerHandler)

export default app
