import { fileURLToPath } from 'node:url'
import build from '@hono/vite-build/bun'
import adapter from '@hono/vite-dev-server/bun'
import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app', import.meta.url))
    }
  },
  plugins: [
    honox({
      devServer: { adapter },
      client: { input: ['/app/client.ts', '/app/style.css'] }
    }),
    tailwindcss(),
    // staticRoot: the generated entry serves static files relative to cwd, and
    // the build output (public/ included) lands in dist/.
    //
    // three is external so the SSR build does not emit a half-megabyte copy of
    // it into dist/. The sky imports it dynamically from an effect, so the
    // server never resolves that import.
    //
    // The Bun entry exports the app rather than calling serve(), so the port
    // is Bun's to choose: 3000 by default, or $PORT.
    build({
      staticRoot: './dist',
      external: ['three'],
      // The CV PDF is printed after this build, so it is not on disk when the
      // plugin scans public/ and dist/ to decide what to serve. Without naming
      // it here the route would not exist and /cv.pdf would 404 in production.
      staticPaths: ['/cv.pdf']
    })
  ]
})
