import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    // App code runs both on the server (SSR) and, for islands, in the browser.
    files: ['app/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    }
  },
  {
    files: ['*.config.{ts,mts,mjs}', 'scripts/**/*.mjs'],
    languageOptions: {
      globals: globals.node
    }
  },
  {
    // Hono types Env.Variables / Env.Bindings as object literals to extend.
    files: ['app/global.d.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off'
    }
  }
)
