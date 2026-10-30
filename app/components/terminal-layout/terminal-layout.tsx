import type { PropsWithChildren } from 'hono/jsx'
import { cva } from 'class-variance-authority'

const frameStyles = cva('screen relative mx-auto flex min-h-dvh flex-col', {
  variants: { layout: {
    home: 'max-w-350 px-8 narrow:px-5 wide:max-w-375',
    error: 'max-w-350 px-5 wide:max-w-375',
    fallback: 'max-w-350 px-8 narrow:px-5 wide:max-w-375',
  } }, defaultVariants: { layout: 'home' },
})
const mainStyles = cva('relative isolate flex min-h-0 flex-1 flex-col items-center', {
  variants: { layout: {
    home: 'justify-start pt-28 pb-8 narrow:pt-8',
    error: 'justify-center py-8 text-center',
    fallback: 'justify-center py-16',
  } }, defaultVariants: { layout: 'home' },
})
export type TerminalLayoutProps = PropsWithChildren<{
  layout?: 'home' | 'error' | 'fallback'
  footer?: PropsWithChildren['children']
}>
export function TerminalLayout({ layout = 'home', children, footer }: TerminalLayoutProps) {
  return <div class={frameStyles({ layout })}><main class={mainStyles({ layout })}>{children}</main>{footer}</div>
}
