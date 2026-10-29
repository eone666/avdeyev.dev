import type { Plugin } from 'vite'

/** Vite 8 replacement for HonoX's client plugin, which still configures esbuild. */
export function clientBuild(input: string[]): Plugin {
  return {
    name: 'client-build',
    apply: (_config, { command, mode }) => command === 'build' && mode === 'client',
    config: () => ({
      build: {
        rolldownOptions: { input },
        assetsDir: 'static',
        manifest: true
      }
    })
  }
}
