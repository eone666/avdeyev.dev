for (const root of document.querySelectorAll<HTMLElement>('[data-share-root]')) {
  const button = root.querySelector<HTMLButtonElement>('[data-share-native]')
  const fallback = root.querySelector<HTMLElement>('[data-share-fallback]')
  const data = {
    title: root.dataset.title ?? document.title,
    url: root.dataset.url ?? window.location.href
  }

  if (!button || !fallback || typeof navigator.share !== 'function') continue
  if (typeof navigator.canShare === 'function' && !navigator.canShare(data)) continue

  button.hidden = false
  fallback.hidden = true

  button.addEventListener('click', async () => {
    try {
      await navigator.share(data)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      button.hidden = true
      fallback.hidden = false
    }
  })
}
