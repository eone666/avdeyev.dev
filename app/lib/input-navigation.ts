/** Shared input mode: reveal a frame when none exists; otherwise move from it. */
export function createInputNavigation(root: Document = document) {
  let keyboard = false
  let pointerTarget: Element | null = null
  let pointerX: number | undefined
  let pointerY: number | undefined
  const setMode = (enabled: boolean) => {
    keyboard = enabled
    root.documentElement.dataset.input = enabled ? 'keyboard' : 'pointer'
  }
  const onPointer = (event: PointerEvent) => {
    // Scrolling or changing layout can emit pointer events under a stationary mouse.
    if (event.type === 'pointermove' && event.clientX === pointerX && event.clientY === pointerY) return
    pointerX = event.clientX
    pointerY = event.clientY
    setMode(false)
    pointerTarget = event.target instanceof Element ? event.target : null
  }
  const onPointerOut = (event: PointerEvent) => {
    if (event.relatedTarget === null) pointerTarget = null
  }
  const onBlur = () => { pointerTarget = null }
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Tab' && !event.altKey && !event.ctrlKey && !event.metaKey) {
      pointerTarget = null
      setMode(true)
    }
  }
  root.addEventListener('pointerout', onPointerOut, true)
  root.defaultView?.addEventListener('blur', onBlur)
  root.addEventListener('pointermove', onPointer, true)
  root.addEventListener('pointerdown', onPointer, true)
  root.addEventListener('keydown', onKey, true)
  setMode(false)

  return {
    pointerItem<T extends HTMLElement>(items: T[]) {
      return keyboard ? undefined : items.find(item => pointerTarget && item.contains(pointerTarget) && item.matches(':hover'))
    },
    focusedItem<T extends HTMLElement>(items: T[]) {
      return keyboard ? items.find(item => item === root.activeElement) : undefined
    },
    enable() { pointerTarget = null; setMode(true) },
    navigate(event: KeyboardEvent, initial: HTMLElement | undefined, move: () => void, hasFrame = keyboard) {
      event.preventDefault()
      const entering = !hasFrame
      pointerTarget = null
      setMode(true)
      if (entering) initial?.focus({ preventScroll: true })
      else move()
    },
    destroy() {
      root.removeEventListener('pointerout', onPointerOut, true)
      root.defaultView?.removeEventListener('blur', onBlur)
      root.removeEventListener('pointermove', onPointer, true)
      root.removeEventListener('pointerdown', onPointer, true)
      root.removeEventListener('keydown', onKey, true)
      delete root.documentElement.dataset.input
    },
  }
}
