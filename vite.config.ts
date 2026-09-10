import { fileURLToPath } from 'node:url'
import build from '@hono/vite-build/bun'
import adapter from '@hono/vite-dev-server/bun'
import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { defineConfig } from 'vite'
import { iconSubset } from './scripts/icon-subset.mjs'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app', import.meta.url))
    }
  },
  plugins: [
    iconSubset(),
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
      // Keep the site's CV download URL explicitly registered.
      staticPaths: ['/cv.pdf']
    })
  ]
})
