import app from '@/index'
import { env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

describe('index test', () => {
  it('Should be 200, and content should be "Hello Hono!"', async () => {
    const res = await app.request('/', {}, env)

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello Hono!')
  })

  it('Should be 404', async () => {
    const res = await app.request('/abc', {}, env)

    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'Not Found - /abc' })
  })
})

describe('doc link test', () => {
  it('Should be 200, and content-type should be json', async () => {
    const res = await app.request('/doc', {}, env)

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe(
      'application/json; charset=UTF-8'
    )
  })

  it('should have "openapi" and "info" keys', async () => {
    const res = await app.request('/doc', {}, env)
    const data = await res.json()

    expect(data).toHaveProperty('openapi')
    expect(data).toHaveProperty('info')
  })
})

describe('reference link test', () => {
  it('Should be 200, and content-type should be HTML', async () => {
    const res = await app.request('/reference', {}, env)

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/html; charset=UTF-8')
  })
})
