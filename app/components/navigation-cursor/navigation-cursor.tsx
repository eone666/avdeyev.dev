import { cursorStyles } from './navigation-cursor.styles'

export type NavigationCursorProps = { placement?: 'item' | 'action' }

/** Shared marker; content rows hide it on touch layouts without reserving space. */
export function NavigationCursor({ placement }: NavigationCursorProps) {
  return <span class={cursorStyles({ placement })} aria-hidden="true">›</span>
}
