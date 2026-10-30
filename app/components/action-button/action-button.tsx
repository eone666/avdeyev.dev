import type { PropsWithChildren } from 'hono/jsx'
import { cva } from 'class-variance-authority'
import { focusRing } from '@/lib/focus-ring'

const buttonStyles = cva('cursor-pointer whitespace-nowrap', {
  variants: {
    appearance: {
      text: 'bg-transparent text-foreground hover:text-primary',
      muted: 'bg-transparent text-muted hover:text-primary',
      filled: 'bg-line px-4 py-3 text-foreground hover:bg-primary hover:text-background',
    },
  },
  defaultVariants: { appearance: 'text' },
})
export type ActionButtonProps = PropsWithChildren<{
  id?: string
  label?: string
  appearance?: 'text' | 'muted' | 'filled'
  compact?: boolean
}>
export function ActionButton({ id, label, appearance, compact = false, children }: ActionButtonProps) {
  return <button type="button" id={id} aria-label={label} class={`${buttonStyles({ appearance })} ${focusRing} ${compact ? 'py-1' : 'min-h-11'}`}>{children}</button>
}
