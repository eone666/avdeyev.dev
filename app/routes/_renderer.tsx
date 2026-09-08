import { jsxRenderer } from 'hono/jsx-renderer'
import { Link, Script } from 'honox/server'

const DEFAULT_TITLE = 'Ivan Avdeyev | Frontend Developer'
const DEFAULT_VIEWPORT = 'width=device-width, initial-scale=1'

export default jsxRenderer(({ children, title, description, viewport }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content={viewport ?? DEFAULT_VIEWPORT} />
        <title>{title ?? DEFAULT_TITLE}</title>
        {description && <meta name="description" content={description} />}
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon-96.png" type="image/png" sizes="96x96" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <Link href="/app/style.css" rel="stylesheet" />
        <Script src="/app/client.ts" async />
      </head>
      <body class="antialiased font-mono">{children}</body>
    </html>
  )
})
