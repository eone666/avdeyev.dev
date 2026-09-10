const MIN_WIDTH = 768

const canvas = document.querySelector<HTMLCanvasElement>('[data-voxel-background]')

if (canvas) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let teardown: (() => void) | undefined
  let idleId: number | undefined
  let idleFallback: ReturnType<typeof setTimeout> | undefined
  let loading = false

  const canRenderScene = () => {
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean }
    }).connection

    return !connection?.saveData
      && !window.matchMedia('(prefers-reduced-data: reduce)').matches
      && !reducedMotion.matches
      && window.matchMedia(`(min-width: ${MIN_WIDTH}px)`).matches
  }

  const wantsScene = () => !document.hidden && canRenderScene()

  const showStaticFallback = () => {
    canvas.dataset.scene = 'static'
  }

  const cancelIdle = () => {
    if (idleId !== undefined) {
      window.cancelIdleCallback?.(idleId)
      idleId = undefined
    }
    if (idleFallback !== undefined) {
      clearTimeout(idleFallback)
      idleFallback = undefined
    }
  }

  const load = async () => {
    idleId = undefined
    if (idleFallback !== undefined) {
      clearTimeout(idleFallback)
      idleFallback = undefined
    }
    if (loading || teardown || !wantsScene()) return
    loading = true

    try {
      const [{ mountVoxelBackground }, THREE] = await Promise.all([
        import('@/lib/voxel-background-runtime'),
        import('@/lib/three-subset')
      ])
      if (wantsScene()) {
        teardown = mountVoxelBackground(canvas, THREE, Number(canvas.dataset.seed))
        if (!teardown) showStaticFallback()
      }
    } catch (error) {
      showStaticFallback()
      console.warn('Could not load the voxel background', error)
    } finally {
      loading = false
    }
  }

  const schedule = () => {
    if (idleId !== undefined || loading || teardown || !wantsScene()) return
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(() => void load(), { timeout: 2_000 })
      // Some background/automated browsers postpone idle callbacks even with
      // a timeout. This guard still re-checks visibility before downloading.
      idleFallback = setTimeout(() => {
        idleFallback = undefined
        if (idleId !== undefined) window.cancelIdleCallback(idleId)
        idleId = undefined
        void load()
      }, 2_100)
    } else {
      idleId = Number(setTimeout(() => void load(), 1))
    }
  }

  const stop = () => {
    cancelIdle()
    teardown?.()
    teardown = undefined
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelIdle()
    else schedule()
  })
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      stop()
      showStaticFallback()
    } else {
      delete canvas.dataset.scene
      schedule()
    }
  })

  if (canRenderScene()) schedule()
  else showStaticFallback()
}
