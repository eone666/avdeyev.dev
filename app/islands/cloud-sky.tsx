/**
 * The scene behind the home page.
 *
 * There are only two colours in it. Every surface is black — the cloud and
 * terrain bodies are painted the page's own background and exist purely to
 * write depth and block light. Everything you can actually see is green, and
 * it is all light: additive wireframes, the sun's disc, its halo, the ambient
 * wash, the scattered haze, the fog. Nothing here is a lit material.
 *
 * That is worth keeping. Every attempt to give a surface a colour of its own
 * has turned the wireframe into solid masses and put the background in
 * competition with the card.
 */
import { useEffect, useRef } from 'hono/jsx'
import { createCloudLayer } from '@/lib/cloud-layer'
import { createSun } from '@/lib/sky-sun'
import { createTerrainLayer } from '@/lib/terrain-layer'

export type CloudSkyProps = {
    /** A fresh seed per page load. */
    seed: number
}

/** Camera sits well below the slab and tilts up, putting the horizon low. */
const CAMERA_X = 0
const CAMERA_Y = -80
const CAMERA_Z = 40
const PITCH = (11 * Math.PI) / 180

const LIGHT = { clouds: [0.2, 0.78], ground: [0.12, 0.46], fog: [0, 0.16] } as const

/**
 * How much of what is behind a cloud or a mountain still shows through.
 *
 * The bodies stay the page's own background colour on purpose. Filling them
 * with a lit colour instead turns the clouds into solid pale masses: it is
 * closer to Minecraft, but the outlines vanish into the fill and the bright
 * sky starts competing with the card. Tried it; the wireframe is the point.
 */
const BODY_OPACITY = 0.88

const lerp = (range: readonly [number, number], t: number) =>
    range[0] + (range[1] - range[0]) * t

const LIME = 0xbef202

/** Narrower than this and the scene is skipped entirely. */
const MIN_WIDTH = 768

/**
 * Whether this device gets the scene at all.
 *
 * Skipping means the dynamic import never runs, so three.js is not merely
 * unused but never fetched — no 128 kB over what is usually a phone's data
 * plan, no WebGL context, no render loop draining the battery. What is left is
 * the canvas' own CSS background: the same green horizon glow, held still.
 *
 * Decided once on mount. Re-checking on resize would mean a rotation could
 * trigger half a megabyte of download mid-visit.
 */
function wantsScene() {
    const connection = (navigator as Navigator & {
        connection?: { saveData?: boolean }
    }).connection

    if (connection?.saveData) return false
    if (window.matchMedia('(prefers-reduced-data: reduce)').matches) return false

    return window.matchMedia(`(min-width: ${MIN_WIDTH}px)`).matches
}

/**
 * Resolves any CSS colour to a hex number by letting the browser paint it.
 * Works whatever notation the theme uses — oklch included, which three.js
 * cannot parse itself.
 */
function cssColor(value: string, fallback: number) {
    const probe = document.createElement('canvas')
    probe.width = 1
    probe.height = 1

    const ctx = probe.getContext('2d')
    if (!ctx) return fallback

    ctx.fillStyle = value
    ctx.fillRect(0, 0, 1, 1)

    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
    return a === 0 ? fallback : (r << 16) | (g << 8) | b
}

type Three = typeof import('@/lib/three-subset')

/** Builds the scene and returns its teardown. */
function mountSky(canvas: HTMLCanvasElement, THREE: Three, seed: number) {
    let renderer: InstanceType<Three['WebGLRenderer']>
    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            // Subpixel coverage keeps thin voxel outlines steady while drifting.
            antialias: true,
            powerPreference: 'low-power'
        })
    } catch {
        // No WebGL: leave the sky empty rather than breaking the page.
        return undefined
    }

    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

    const scene = new THREE.Scene()
    // Fog stands in for the horizon: the far clouds dissolve into it. Its
    // colour is tinted by the sun's height, which is what carries the daylight
    // out into the distance.
    const fog = new THREE.Fog(0x000000, 100, 430)
    scene.fog = fog

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 3000)
    camera.position.set(CAMERA_X, CAMERA_Y, CAMERA_Z)
    camera.rotation.x = PITCH

    // Shared by the cloud body and the terrain body. Very slightly see-through,
    // so a covered sun still bleeds a little and the wireframe behind a mass
    // is hinted at rather than gone.
    const bodyMaterial = new THREE.MeshBasicMaterial({
        color: cssColor(getComputedStyle(document.body).backgroundColor, 0x000000),
        side: THREE.DoubleSide,
        fog: false,
        transparent: true,
        opacity: BODY_OPACITY,
        // Nudge it back so it never z-fights with its own outline.
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    })

    const gl = renderer.getContext()
    const clouds = createCloudLayer(THREE, seed, bodyMaterial, LIME, gl.getParameter(gl.SAMPLES) > 0)
    scene.add(clouds.group)

    const ground = createTerrainLayer(THREE, camera, seed, bodyMaterial, LIME)
    scene.add(ground.group)

    const sun = createSun(THREE, camera, seed)
    scene.add(sun.group)
    clouds.material.opacity = lerp(LIGHT.clouds, sun.light)
    ground.material.opacity = lerp(LIGHT.ground, sun.light)
    ground.distantMaterial.opacity = ground.material.opacity * 0.55
    fog.color.set(LIME).multiplyScalar(lerp(LIGHT.fog, sun.light))

    const resize = () => {
        const width = window.innerWidth
        const height = window.innerHeight
        camera.aspect = width / height
        camera.updateProjectionMatrix()

        clouds.resize(camera)
        ground.resize()
        renderer.setSize(width, height, false)
        renderer.render(scene, camera)
    }
    resize()

    const stillPreferred = window.matchMedia('(prefers-reduced-motion: reduce)')

    let frame = 0
    let last = performance.now()

    const tick = (now: number) => {
        const delta = Math.min((now - last) / 1000, 0.1)
        last = now

        clouds.update(delta, camera)
        renderer.render(scene, camera)
        frame = requestAnimationFrame(tick)
    }

    const start = () => {
        if (frame || stillPreferred.matches || document.hidden) return
        last = performance.now()
        frame = requestAnimationFrame(tick)
    }

    const stop = () => {
        if (!frame) return
        cancelAnimationFrame(frame)
        frame = 0
    }

    // A hidden tab should not burn frames.
    const onVisibility = () => (document.hidden ? stop() : start())
    const onMotionChange = () => {
        stop()
        renderer.render(scene, camera)
        start()
    }

    renderer.render(scene, camera)
    start()

    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    stillPreferred.addEventListener('change', onMotionChange)

    return () => {
        stop()
        window.removeEventListener('resize', resize)
        document.removeEventListener('visibilitychange', onVisibility)
        stillPreferred.removeEventListener('change', onMotionChange)
        clouds.dispose()
        bodyMaterial.dispose()
        ground.dispose()
        sun.dispose()
        renderer.dispose()
    }
}

export default function CloudSky({ seed }: CloudSkyProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !wantsScene()) return

        let teardown: (() => void) | undefined
        let cancelled = false

        // Dynamic, so three.js lands in its own client chunk and stays out of
        // the SSR bundle — the server never runs this effect.
        import('@/lib/three-subset').then((THREE) => {
            if (cancelled) return
            teardown = mountSky(canvas, THREE, seed)
        }).catch((error) => {
            // The decorative scene may fail to load; the CSS sky still works.
            if (!cancelled) console.warn('Could not load the sky scene', error)
        })

        return () => {
            cancelled = true
            teardown?.()
        }
    }, [])

    return <canvas ref={canvasRef} class="pixel-sky" aria-hidden="true" />
}
