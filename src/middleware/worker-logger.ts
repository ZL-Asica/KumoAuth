import type { Context, MiddlewareHandler } from 'hono'

// Logging middleware dedicated for Cloudflare Workers
export const workerLogger: MiddlewareHandler = async (c: Context, next) => {
  const reqHeaders = Object.fromEntries(Object.entries(c.req.header()))
  const startTime = performance.now()

  const logData: Record<string, unknown> = {
    method: c.req.method,
    url: c.req.url,
    host: reqHeaders.host,
    platform: reqHeaders['sec-ch-ua-platform'],
    userAgent: reqHeaders['user-agent'],
  }

  // log requestCookies only if it exists
  if (reqHeaders.cookie) {
    // Extract cookie names
    logData.requestCookies = reqHeaders.cookie
      ?.split(';')
      .map((c) => c.split('=')[0])
  }

  try {
    await next()

    const responseTime = (performance.now() - startTime).toFixed(2)
    const resHeaders = Object.fromEntries(c.res.headers)
    const statusCode = c.res.status

    // Validate status code
    if (!statusCode || typeof statusCode !== 'number' || isNaN(statusCode)) {
      throw new Error('Invalid response status code')
    }

    // Skip logging for 404 responses
    if (statusCode !== 404) {
      logData.responseTime = `${responseTime} ms`
      logData.statusCode = statusCode
      if ('set-cookie' in resHeaders) {
        logData.responseCookies = resHeaders['set-cookie']
      }

      // Extract `error` field if status code indicates an error
      if (statusCode >= 400) {
        try {
          const responseBody = await c.res.json<{ error: string }>()
          logData.errorMessage = responseBody.error
        } catch {
          logData.errorMessage = 'Failed to parse error message'
        }
      }

      // Log with appropriate level based on status code
      const level = statusCode >= 400 ? 'error' : 'info'
      console[level](
        JSON.stringify({
          level,
          message: `Request processed - ${c.req.method} ${c.req.url}`,
          details: logData,
        })
      )
    }
  } catch (error) {
    logData.errorMessage = (error as Error).message
    console.error(
      JSON.stringify({
        level: 'error',
        message: `Request failed - ${c.req.method} ${c.req.url}`,
        details: logData,
      })
    )
  }
}
