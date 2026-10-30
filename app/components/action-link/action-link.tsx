import type { PropsWithChildren } from 'hono/jsx'
import { cva } from 'class-variance-authority'
import { focusRing } from '@/lib/focus-ring'
import { NavigationCursor } from '../navigation-cursor'

const linkStyles = cva('group relative items-center bg-line py-3 text-foreground hover:bg-primary hover:text-background', {
  variants: { layout: {
    centered: 'inline-flex justify-center px-8',
    row: 'flex justify-between px-3',
  } },
  defaultVariants: { layout: 'centered' },
})
export type ActionLinkProps = PropsWithChildren<{
  href: string
  layout?: 'centered' | 'row'
  returnLink?: boolean
}>
export function ActionLink({ href, layout = 'centered', returnLink = false, children }: ActionLinkProps) {
  return <a href={href} data-return-link={returnLink ? '' : undefined} class={`${linkStyles({ layout })} ${focusRing}`}>
    {returnLink && <NavigationCursor placement="action" />}
    <span class="action-link-label">{children}</span>
    {layout === 'row' && <span aria-hidden="true">{href.startsWith('mailto:') ? '✉' : '↗'}</span>}
  </a>
}
