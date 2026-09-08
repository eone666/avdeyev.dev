import { useEffect } from 'hono/jsx'

export type ScalableBlockProps = {
    /** Selector of the server-rendered element to scale. */
    target: string
}

/**
 * Scales a fixed-width block down so it fits narrow viewports.
 *
 * Takes a selector instead of `children` on purpose: an island with children
 * makes HonoX serialize the whole subtree a second time into a <template> for
 * hydration, and the CV subtree is two full A4 pages of markup.
 */
export default function ScalableBlock({ target }: ScalableBlockProps) {
    useEffect(() => {
        const el = document.querySelector<HTMLElement>(target)
        if (!el) return

        const adjustScale = () => {
            // Reset the height applied by the previous pass, otherwise
            // scrollHeight reports the clamped height instead of the content's.
            el.style.height = 'auto'

            const viewportWidth = window.visualViewport
                ? window.visualViewport.width
                : window.innerWidth

            const scale = Math.min(viewportWidth / el.scrollWidth, 1)

            el.style.transform = `scale(${scale})`
            el.style.height = `${el.scrollHeight * scale}px`
            el.style.opacity = '1'
        }

        const frame = requestAnimationFrame(adjustScale)

        window.visualViewport?.addEventListener('resize', adjustScale)
        window.addEventListener('resize', adjustScale)

        return () => {
            cancelAnimationFrame(frame)
            window.visualViewport?.removeEventListener('resize', adjustScale)
            window.removeEventListener('resize', adjustScale)
        }
    }, [])

    return null
}
