import { env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import app from '@/index'

describe('index test', () => {
  it('Should be 200, and content should be "Hello Hono!"', async () => {
    const response = await app.request('/', {}, env)

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('Hello Hono!')
  })

  it('Should be 404', async () => {
    const response = await app.request('/abc', {}, env)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Not Found - /abc' })
  })
})

describe('doc link test', () => {
  it('Should be 200, and content-type should be json', async () => {
    const response = await app.request('/doc', {}, env)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe(
      'application/json; charset=UTF-8'
    )
  })

  it('should have "openapi" and "info" keys', async () => {
    const response = await app.request('/doc', {}, env)
    const data = await response.json()

    expect(data).toHaveProperty('openapi')
    expect(data).toHaveProperty('info')
  })
})

describe('reference link test', () => {
  it('Should be 200, and content-type should be HTML', async () => {
    const response = await app.request('/reference', {}, env)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe(
      'text/html; charset=UTF-8'
    )
  })
})
