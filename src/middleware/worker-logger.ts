import type { Context, MiddlewareHandler } from 'hono'
import { getConnInfo } from 'hono/cloudflare-workers'

// Logging middleware dedicated for Cloudflare Workers
export const workerLogger: MiddlewareHandler = async (c: Context, next) => {
  const startTime = performance.now()
  const info = getConnInfo(c)
  const cfData = c.req.raw.cf || {}

  const logData: Record<string, unknown> = {
    method: c.req.method,
    url: c.req.url,
    transport: info.remote.transport || null,
    address: info.remote.address || null,
    port: info.remote.port || null,
    addressType: info.remote.addressType || null,
    location:
      `${cfData.city || ''}, ${cfData.region || ''}, ${cfData.country || ''}`.replaceAll(
        /(^,)|(,$)/g,
        ''
      ) || null,
    timezone: cfData.timezone || null,
    reqCookies:
      c.req
        .header('cookie')
        ?.split(';')
        .map((c) => c.split('=')[0].trim()) || null,
    platform: c.req.header('sec-ch-ua-platform')?.replace(/"/g, '') || null,
    UA: c.req.header('User-Agent') || null,
  }

  try {
    await next()

    const responseTime = `${(performance.now() - startTime).toFixed(2)} ms`
    const statusCode = c.res.status || null

    // Validate status code
    if (!statusCode) {
      throw new Error('Invalid response status code')
    }

    // Skip logging for 404 responses
    if (statusCode !== 404) {
      logData.statusCode = statusCode
      logData.responseTime = responseTime
      logData.resCookies = c.res.headers.get('set-cookie') || null

      // Extract `error` field if status code indicates an error
      if (statusCode >= 400) {
        try {
          const responseBody = await c.res.json<{ error: string }>()
          logData.errorMessage = responseBody?.error || 'Unknown error'
        } catch {
          logData.errorMessage = 'Unknown error'
        }
      }

      // Log with appropriate level based on status code
      const level = statusCode >= 400 ? 'error' : 'info'
      console[level](
        JSON.stringify({
          level,
          message: `[${statusCode}] - [${c.req.method}] ${c.req.url}`,
          details: logData,
        })
      )
    }
  } catch (error) {
    logData.errorMessage = (error as Error).message || 'Unknown error'
    console.error(
      JSON.stringify({
        level: 'error',
        message: `[${logData.statusCode || '500'}] - [${c.req.method}] ${c.req.url} - ${logData.errorMessage}`,
        details: logData,
      })
    )
  }
}
