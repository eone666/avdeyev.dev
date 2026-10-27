import { fileURLToPath } from 'node:url'
import build from '@hono/vite-build/bun'
import adapter from '@hono/vite-dev-server/bun'
import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { defineConfig } from 'vite'
import { serveStaticWithHeaders } from './config/bun-server-entry.js'
import { clientBuild } from './config/client-build.js'
import { iconSubset } from './config/icon-subset.js'

const clientEntries = [
  '/app/voxel-background-client.ts',
  '/app/share-client.ts',
  '/app/style.css'
]

const honoPlugins = honox({
  islands: false,
  devServer: { adapter }
}).filter((plugin) => {
  return !(plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === 'honox-vite-client')
})

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app', import.meta.url))
    }
  },
  plugins: [
    iconSubset(),
    ...honoPlugins,
    clientBuild(clientEntries),
    tailwindcss(),
    build({
      staticRoot: './dist',
      external: ['three'],
      entryContentBeforeHooks: [serveStaticWithHeaders],
      staticPaths: ['/cv.pdf', '/profile.json', '/resume.json']
    })
  ]
})
