import { fileURLToPath } from 'node:url'
import adapter from '@hono/vite-dev-server/bun'
import honox from 'honox/vite'
import { defineConfig } from 'vite'
import { clientBuild } from './config/client-build.js'

const clientEntries = [
  '/app/terminal-client.ts',
  '/app/style.css'
]

const honoPlugins = honox({
  islands: false,
  devServer: { adapter }
}).filter((plugin) => {
  return !(plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === 'honox-vite-client')
})

export default defineConfig(({ mode }) => ({
  appType: 'mpa',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app', import.meta.url))
    }
  },
  plugins: [
    ...honoPlugins,
    clientBuild(clientEntries)
  ],
  ...(mode !== 'client' ? {
    ssr: { noExternal: true },
    build: {
      outDir: '.render',
      emptyOutDir: true,
      ssr: 'app/server.ts',
      rollupOptions: { output: { entryFileNames: 'app.js' } }
    }
  } : {})
}))
