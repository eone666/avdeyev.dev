import { terminalKey } from './lib/terminal'
import { createInputNavigation } from './lib/input-navigation'

function initializeTerminal() {
  const navigation = createInputNavigation()
  const menu = document.querySelector<HTMLElement>('#menu')
  const rows = Array.from(menu?.querySelectorAll<HTMLAnchorElement>('.menu-row') ?? [])
  const description = document.querySelector<HTMLElement>('#description')
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-tab]'))
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'))
  const toast = document.querySelector<HTMLElement>('#toast')!
  const help = document.querySelector<HTMLDialogElement>('#help-dialog')
  let helpReturnFocus: HTMLElement | null = null
  document.querySelector('#close-help')?.addEventListener('click', () => help?.close())
  help?.addEventListener('close', () => helpReturnFocus?.focus({ preventScroll: true }))
  function toggleHelp() {
    if (!help) return
    if (help.open) help.close()
    else {
      helpReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
      help.showModal()
    }
  }
  document.querySelector('#show-help')?.addEventListener('click', toggleHelp)
  let activeTab = 0
  let selected = 0
  let toastTimer: ReturnType<typeof setTimeout>

  function select(index: number, focus = false) {
    selected = (index + rows.length) % rows.length
    rows.forEach((row, i) => { row.dataset.selected = String(i === selected) })
    if (description) description.textContent = rows[selected].dataset.description ?? ''
    if (focus && document.activeElement !== rows[selected]) rows[selected].focus({ preventScroll: true })
  }
  rows.forEach((row, index) => {
    const pointerSelect = (event: PointerEvent) => {
      if (event.buttons || window.getSelection()?.isCollapsed === false) return
      select(index)
    }
    row.addEventListener('pointerenter', pointerSelect)
    row.addEventListener('pointermove', pointerSelect)
    row.addEventListener('focus', () => select(index))
  })

  function activateTab(index: number, focusContent = true) {
    activeTab = (index + tabs.length) % tabs.length
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === activeTab))
      tab.tabIndex = i === activeTab ? 0 : -1
    })
    sections.forEach(section => { section.hidden = section.dataset.section !== tabs[activeTab].dataset.tab })
    const section = sections.find(section => !section.hidden)!
    if (description) description.textContent = activeTab === 0
      ? rows[selected]?.dataset.description ?? ''
      : ({ projects: 'Selected projects, experiments, and things I build.', about: 'Frontend development, reusable UI systems, and curiosity.' }[section.dataset.section!] ?? '')
    if (focusContent) (section.querySelector<HTMLElement>('a[href]') ?? section).focus({ preventScroll: true })
  }
  tabs.forEach((tab, index) => tab.addEventListener('click', () => activateTab(index, false)))

  function notify(message: string) {
    toast.textContent = message
    toast.hidden = false
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { toast.hidden = true }, 3200)
  }
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText('contact@avdeyev.dev')
      if (description) description.textContent = 'Email copied: contact@avdeyev.dev'
      notify('Email address copied.')
    } catch {
      if (description) description.textContent = 'Email: contact@avdeyev.dev'
      notify('contact@avdeyev.dev')
    }
  }
  for (const id of ['copy-email', 'copy-email-mobile']) document.getElementById(id)?.addEventListener('click', copyEmail)

  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return
    const target = event.target
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || (target instanceof HTMLElement && target.isContentEditable)) return
    const key = terminalKey(event)
    if (key === '?' && help) {
      event.preventDefault()
      navigation.enable()
      toggleHelp()
      return
    }
    if (help?.open || event.shiftKey || window.getSelection()?.isCollapsed === false) return
    if (tabs.length && ['ArrowLeft', 'ArrowRight', 'h', 'l'].includes(key)) {
      event.preventDefault()
      navigation.enable()
      activateTab(activeTab + (['ArrowRight', 'l'].includes(key) ? 1 : -1))
      return
    }
    const forward = ['ArrowDown', 'j'].includes(key)
    const backward = ['ArrowUp', 'k'].includes(key)
    if (forward || backward) {
      const scope = sections.find(section => !section.hidden) ?? document
      const controls = Array.from(scope.querySelectorAll<HTMLAnchorElement>(sections.length ? 'a[href]' : '.back-home'))
        .filter(control => control.getClientRects().length > 0 && !control.classList.contains('skip'))
      if (!controls.length) return
      const hovered = navigation.pointerItem(controls)
      const focused = navigation.focusedItem(controls)
      const framed = hovered ?? focused
      const initial = hovered ?? focused ?? (activeTab === 0 ? rows[selected] : undefined) ?? controls[0]
      navigation.navigate(event, initial, () => {
        const current = controls.indexOf(framed ?? document.activeElement as HTMLAnchorElement)
        const direction = forward ? 1 : -1
        const next = current < 0 ? (forward ? 0 : controls.length - 1) : (current + direction + controls.length) % controls.length
        controls[next].focus()
      }, Boolean(framed))
      return
    }
    if (!menu) return
    if (event.key === 'Enter' && target === document.body && activeTab === 0) rows[selected]?.click()
    else if (key === 'c') void copyEmail()
  })

}

initializeTerminal()

function initializeCursorFavicon() {
  const icon = document.querySelector<HTMLLinkElement>('#site-favicon')
  if (!icon) return
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let timer: ReturnType<typeof setInterval> | undefined
  let visible = true
  function update() {
    clearInterval(timer)
    visible = true
    icon!.href = '/icon.svg'
    if (reducedMotion.matches || document.hidden) return
    timer = setInterval(() => {
      visible = !visible
      icon!.href = visible ? '/icon.svg' : '/icon-idle.svg'
    }, 600)
  }
  reducedMotion.addEventListener('change', update)
  document.addEventListener('visibilitychange', update)
  update()
}

initializeCursorFavicon()
