const STATIC_ROOT = './dist'

type EntryContentHook = (
  appName: string,
  options?: { staticPaths: string[] }
) => string | Promise<string>

/**
 * The Bun adapter normally generates its own static-file middleware. Supplying
 * an entry hook replaces that default, so this hook restores static serving
 * and attaches the production cache and security headers in one place.
 */
export const serveStaticWithHeaders: EntryContentHook = (appName, options) => {
  const staticRoutes = (options?.staticPaths ?? [])
    .map((path) => `${appName}.use(${JSON.stringify(path)}, serveStatic({ root: '${STATIC_ROOT}' }))`)
    .join('\n')

  return `
import { serveStatic } from 'hono/bun'

${appName}.use('*', async (context, next) => {
  await next()

  context.header('X-Content-Type-Options', 'nosniff')
  context.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  context.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  const path = context.req.path
  if (path.startsWith('/static/')) {
    context.header('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (/\\.(?:png|ico|svg|webp|pdf)$/.test(path)) {
    context.header('Cache-Control', 'public, max-age=86400')
  } else if (path === '/robots.txt' || path === '/sitemap.xml') {
    context.header('Cache-Control', 'public, max-age=3600')
  }
})

${staticRoutes}
`.trim()
}
