/** Render HTML once at build time; ship only static files in dist/. */
import { readdir, rm } from 'node:fs/promises'
import type { Hono } from 'hono'
import { ErrorPage } from '../app/components/error-page'

const output = new URL('../dist/', import.meta.url)
const renderer = new URL('../.render/', import.meta.url)
const { default: app }: { default: Hono } = await import(new URL('app.js', renderer).href)

// Build-only endpoint: use the same renderer and error component as development.
app.get('/__export/500', c => {
  c.status(500)
  return c.render(<ErrorPage code="500" title="Internal server error" description="The page is temporarily unavailable. Please try again later." />, {
    title: 'Ivan Avdeyev | Internal server error',
    description: 'The page is temporarily unavailable.',
    robots: 'noindex, nofollow',
  })
})

for (const page of [
  { path: '/', file: 'index.html', status: 200 },
  { path: '/__export/404', file: '404.html', status: 404 },
  { path: '/__export/500', file: '50x.html', status: 500 },
]) {
  const response = await app.fetch(new Request(`https://avdeyev.dev${page.path}`))
  if (response.status !== page.status) throw new Error(`Static export ${page.path}: ${response.status}`)
  const html = await response.text()
  if (!html.startsWith('<!DOCTYPE html>') || html.includes('/undefined')) throw new Error(`Invalid HTML: ${page.file}`)
  // Every generated asset reference must resolve inside the static output.
  for (const match of html.matchAll(/(?:src|href)="(\/[^"#?]*)[^"]*"/g)) {
    const path = match[1]
    if (path === '/') continue
    if (!(await Bun.file(new URL(`.${path}`, output)).exists())) {
      throw new Error(`Missing static asset ${path} referenced by ${page.file}`)
    }
  }
  await Bun.write(new URL(page.file, output), html)
}

// Build metadata and the Hono renderer are not part of the exported website.
await rm(new URL('.vite/', output), { recursive: true, force: true })
await rm(renderer, { recursive: true, force: true })
const files = await readdir(output)
if (files.some(file => /\.(?:ts|tsx|js)$/.test(file))) throw new Error('Unexpected server source in static output')
console.log('Exported index.html, 404.html, and 50x.html; removed build-time renderer.')
