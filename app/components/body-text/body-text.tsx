import type { PropsWithChildren } from 'hono/jsx'

export function BodyText({ children }: PropsWithChildren) {
  return <p class="about-copy my-3 text-xs leading-readable text-muted">{children}</p>
}
