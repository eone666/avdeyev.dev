import type {} from 'hono'

type Head = {
  title?: string
  description?: string
  canonical?: string
  robots?: string
  /** Overrides the default responsive viewport. */
  viewport?: string
}

declare module 'hono' {
  interface Env {
    Variables: {}
    Bindings: {}
  }

  interface ContextRenderer {
    (content: string | Promise<string>, head?: Head): Response | Promise<Response>
  }
}
