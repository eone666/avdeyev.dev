import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

/** Keep literal Remix names used by the app; dev retains the full catalogue. */
export function iconSubset(): Plugin {
  return {
    name: 'remix-icon-subset',
    enforce: 'pre',
    apply: 'build',
    load(id) {
      if (!id.replaceAll('\\', '/').endsWith('/@iconify-json/ri/icons.json')) return
      const set = JSON.parse(readFileSync(id, 'utf8'))
      const names = new Set<string>()
      const scan = (directory: string) => {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
          const path = join(directory, entry.name)
          if (entry.isDirectory()) scan(path)
          else if (/\.[cm]?[jt]sx?$/.test(entry.name)) {
            this.addWatchFile(path)
            const source = readFileSync(path, 'utf8')
            for (const match of source.matchAll(/["'`]([a-z0-9-]+)["'`]/g)) {
              if (Object.hasOwn(set.icons, match[1])) names.add(match[1])
            }
          }
        }
      }
      scan('app')
      scan('shared')
      return JSON.stringify({ ...set, icons: Object.fromEntries([...names].map(name => [name, set.icons[name]])) })
    },
  }
}
