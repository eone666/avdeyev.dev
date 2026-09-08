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
import { buildSolid, buildWireframe, generateCloudField } from '@/lib/clouds'
import { buildTerrainSolid, buildTerrainWireframe, generateTerrain } from '@/lib/terrain'

export type CloudSkyProps = {
    /** A fresh seed per page load. */
    seed: number
}

/**
 * Minecraft's cloud layer: one flat slab of voxels seen from underneath.
 *
 * It sits high above the camera on purpose. Close to the camera the blocks
 * turn into huge planks and stop reading as cloud; far above, they stay small
 * and the layer keeps to the top of the frame, leaving the lower half to the
 * ground. The mild taper thins the far edge so it has no visible cut.
 */
const FIELD = { cols: 96, rows: 110, count: 95, specks: 150, taper: 1.35 }
const CELL = 4
const THICKNESS = 3
const TILE = FIELD.cols * CELL

/** Copies laid end to end, so the drift never runs out of clouds. */
const COPIES = 5

/** How far in front of the camera the slab still extends. */
const OVERHEAD = 80

/**
 * Static voxel terraces below the horizon. Coarse ridged noise: broad forms
 * stay legible at distance, and the exponent keeps most of it low so the few
 * peaks that rise past eye level read as mountains breaking the horizon.
 */
const GROUND = {
    cols: 120, rows: 70, levels: 16,
    spacing: 24, octaves: 3, exponent: 2.2, ridged: true
}
const GROUND_CELL = 8
const GROUND_STEP = 7
const GROUND_Y = -134

/** Camera sits well below the slab and tilts up, putting the horizon low. */
const CAMERA_X = 0
const CAMERA_Y = -80
const CAMERA_Z = 40
const PITCH = (11 * Math.PI) / 180

/**
 * The sun, placed in the scene rather than painted on the page, so it sits at
 * a real distance behind the clouds and shifts with the camera's framing.
 * Angles are relative to the camera's forward direction.
 */
const SUN = {
    distance: 700,
    /** Edge length in world units — Minecraft's sun is a square. */
    size: 46,
    /** Halo diameter. Additive, so it lights whatever wireframe is behind it. */
    halo: 470,
    /**
     * The sun is placed at one point on an arc through the sky, picked by the
     * seed. Sampling an arc rather than two independent angles keeps the pair
     * plausible: high suns sit near the middle, low ones off to the side.
     */
    azimuthSwing: 34,
    elevationMid: 20,
    elevationSwing: 14,
    /**
     * A very wide, very soft billboard on top of the halo. At the peak it
     * washes the whole sky; the cloud and terrain bodies occlude it, so the
     * light lands in the gaps the way daylight would.
     */
    ambient: 2600,
    /**
     * Scattered light. Drawn last and without a depth test, so unlike the halo
     * it is *not* stopped by the clouds — that bleed is what makes a covered
     * sun read as diffused rather than simply hidden.
     */
    scatter: 1000
}

/**
 * How lit the scene is at the sun's lowest and highest point. Everything
 * brightens together as the sun climbs.
 */
const LIGHT = {
    clouds: [0.2, 0.78],
    ground: [0.12, 0.46],
    halo: [0.72, 1],
    disc: [0.9, 1],
    ambient: [0.08, 0.7],
    scatter: [0.3, 0.62],
    /** Fog brightness at the peak — distant geometry lifts to a dim green. */
    fog: [0, 0.16]
} as const

/**
 * Additive passes per glow layer. Material opacity stops at 1, so stacking
 * passes is the way to get brighter — and unlike lightening the colour it
 * keeps the hue where it is instead of washing it out to white.
 */
const GLOW_PASSES = 2

/**
 * Time of day, entirely in green: a low sun is a deep saturated lime spread
 * along the horizon, a high one a pale bright lime, round. The hue never
 * leaves the brand's — only lightness moves.
 */
const SUNSET = {
    low: 0x8fbe0a,
    high: 0xdeff5e,
    /** Extra width of the glow at the bottom of the arc. */
    stretch: 0.8
}

/**
 * How much of what is behind a cloud or a mountain still shows through.
 *
 * The bodies stay the page's own background colour on purpose. Filling them
 * with a lit colour instead turns the clouds into solid pale masses: it is
 * closer to Minecraft, but the outlines vanish into the fill and the bright
 * sky starts competing with the card. Tried it; the wireframe is the point.
 */
const BODY_OPACITY = 0.88

const TAU = Math.PI * 2

const lerp = (range: readonly [number, number], t: number) =>
    range[0] + (range[1] - range[0]) * t

/** World units per second. */
const SPEED = 1.3

const LIME = 0xbef202

const radians = (degrees: number) => (degrees * Math.PI) / 180

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

/**
 * Radial falloff for the glow layers, painted once into a 2D canvas. White
 * here is an alpha mask, not a colour: the material tints it green.
 */
function haloTexture(THREE: Three) {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.55)')
    gradient.addColorStop(0.34, 'rgba(255, 255, 255, 0.16)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    return new THREE.CanvasTexture(canvas)
}

type Three = typeof import('@/lib/three-subset')

/** Builds the scene and returns its teardown. */
function mountSky(canvas: HTMLCanvasElement, THREE: Three, seed: number) {
    let renderer: InstanceType<Three['WebGLRenderer']>
    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            // Aliased lines suit the pixel theme, and cost less.
            antialias: false,
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

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 900)
    camera.position.set(CAMERA_X, CAMERA_Y, CAMERA_Z)
    camera.rotation.x = PITCH

    const field = generateCloudField({ ...FIELD, seed })
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
            buildWireframe(field, { cell: CELL, thickness: THICKNESS }),
            3
        )
    )

    // Additive, so crossing lines accumulate brightness instead of just
    // overlapping: dense clusters glow on their own, no bloom pass needed.
    const material = new THREE.LineBasicMaterial({
        color: LIME,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.34
    })

    // The near-invisible body of the clouds. It writes depth, which is what
    // makes the sun and the far wireframe disappear behind a nearer cloud
    // instead of everything showing through everything.
    const solidGeometry = new THREE.BufferGeometry()
    solidGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
            buildSolid(field, { cell: CELL, thickness: THICKNESS }),
            3
        )
    )

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

    const drift = new THREE.Group()
    for (let i = 0; i < COPIES; i++) {
        const tile = new THREE.Group()
        tile.add(new THREE.Mesh(solidGeometry, bodyMaterial))
        tile.add(new THREE.LineSegments(geometry, material))
        tile.position.set(
            (i - Math.floor(COPIES / 2)) * TILE - TILE / 2,
            0,
            OVERHEAD - FIELD.rows * CELL
        )
        drift.add(tile)
    }
    scene.add(drift)

    // Ground: static, so it stays out of the drift group.
    const groundOrigin = {
        x: (-GROUND.cols * GROUND_CELL) / 2,
        z: OVERHEAD - GROUND.rows * GROUND_CELL
    }

    const terrain = generateTerrain({
        ...GROUND,
        seed: seed + 1,
        // Keep the camera's own patch of ground flat, so a peak can never
        // spawn around it. Derived from the camera, not hardcoded, so moving
        // the camera moves the clearing with it.
        clearing: {
            x: (CAMERA_X - groundOrigin.x) / GROUND_CELL,
            z: (CAMERA_Z - groundOrigin.z) / GROUND_CELL,
            inner: 10,
            outer: 24
        }
    })
    const groundGeometry = new THREE.BufferGeometry()
    groundGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
            buildTerrainWireframe(terrain, { cell: GROUND_CELL, step: GROUND_STEP }),
            3
        )
    )

    const groundMaterial = new THREE.LineBasicMaterial({
        color: LIME,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        // Dimmer than the sky, so the clouds stay the subject.
        opacity: 0.2
    })

    const groundSolid = new THREE.BufferGeometry()
    groundSolid.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
            buildTerrainSolid(terrain, { cell: GROUND_CELL, step: GROUND_STEP }),
            3
        )
    )

    const ground = new THREE.Group()
    ground.add(new THREE.Mesh(groundSolid, bodyMaterial))
    ground.add(new THREE.LineSegments(groundGeometry, groundMaterial))
    ground.position.set(groundOrigin.x, GROUND_Y, groundOrigin.z)
    scene.add(ground)

    // Sun. fog: false on both, otherwise the haze would swallow it at this
    // distance; additive so the halo lights the wireframe it sits behind.
    const haloMap = haloTexture(THREE)
    const discGeometry = new THREE.PlaneGeometry(SUN.size, SUN.size)
    const haloGeometry = new THREE.PlaneGeometry(SUN.halo, SUN.halo)

    const discMaterial = new THREE.MeshBasicMaterial({
        color: SUNSET.high,
        fog: false,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    })

    const haloMaterial = new THREE.MeshBasicMaterial({
        map: haloMap,
        fog: false,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    })

    const ambientGeometry = new THREE.PlaneGeometry(SUN.ambient, SUN.ambient)
    const ambientMaterial = new THREE.MeshBasicMaterial({
        map: haloMap,
        fog: false,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0
    })

    const scatterGeometry = new THREE.PlaneGeometry(SUN.scatter, SUN.scatter)
    const scatterMaterial = new THREE.MeshBasicMaterial({
        map: haloMap,
        fog: false,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        // The whole point: it is not stopped by anything in front of the sun.
        depthTest: false,
        opacity: 0
    })

    // Negative renderOrder puts the sun behind every wireframe, so cloud and
    // mountain lines pass in front of it instead of being painted over.
    /** A glow layer, stacked GLOW_PASSES deep for brightness. */
    const glowLayer = (
        geometry: InstanceType<Three['PlaneGeometry']>,
        layerMaterial: InstanceType<Three['MeshBasicMaterial']>,
        order: number
    ) => {
        const group = new THREE.Group()

        for (let pass = 0; pass < GLOW_PASSES; pass++) {
            const mesh = new THREE.Mesh(geometry, layerMaterial)
            mesh.renderOrder = order
            group.add(mesh)
        }

        return group
    }

    // Negative order keeps the ambient, halo and disc behind every wireframe;
    // the scatter layer goes last, over everything, which sells it as haze.
    const sun = new THREE.Group()
    const ambient = glowLayer(ambientGeometry, ambientMaterial, -4)
    const halo = glowLayer(haloGeometry, haloMaterial, -3)
    const scatter = glowLayer(scatterGeometry, scatterMaterial, 2)
    const disc = new THREE.Mesh(discGeometry, discMaterial)
    disc.renderOrder = -2

    sun.add(ambient, halo, disc, scatter)

    // Match the camera's orientation rather than lookAt: aiming at an
    // off-centre target rolls the plane, and the square has to stay square on
    // screen. The camera never moves, so once is enough.
    sun.quaternion.copy(camera.quaternion)
    scene.add(sun)

    const warm = new THREE.Color(SUNSET.low)
    const pale = new THREE.Color(SUNSET.high)
    const daylight = new THREE.Color(LIME)

    /** Places the sun on its arc and lights the scene to match its height. */
    const placeSun = (phase: number) => {
        const azimuth = radians(SUN.azimuthSwing * Math.sin(TAU * phase))
        const elevation = radians(
            SUN.elevationMid - SUN.elevationSwing * Math.cos(TAU * phase)
        )

        sun.position.set(
            CAMERA_X + SUN.distance * Math.sin(azimuth) * Math.cos(elevation),
            CAMERA_Y + SUN.distance * Math.sin(elevation),
            CAMERA_Z - SUN.distance * Math.cos(azimuth) * Math.cos(elevation)
        )

        // 0 at the bottom of the arc, 1 at the top.
        const light = 0.5 - 0.5 * Math.cos(TAU * phase)

        material.opacity = lerp(LIGHT.clouds, light)
        groundMaterial.opacity = lerp(LIGHT.ground, light)
        haloMaterial.opacity = lerp(LIGHT.halo, light)
        discMaterial.opacity = lerp(LIGHT.disc, light)
        ambientMaterial.opacity = lerp(LIGHT.ambient, light)
        scatterMaterial.opacity = lerp(LIGHT.scatter, light)

        // Warm and stretched along the horizon near the bottom of the arc,
        // pale and round at the top.
        for (const target of [discMaterial, haloMaterial, scatterMaterial, ambientMaterial]) {
            target.color.lerpColors(warm, pale, light)
        }

        const spread = 1 + SUNSET.stretch * (1 - light)
        for (const target of [halo, scatter, ambient]) {
            target.scale.set(spread, 1 / Math.sqrt(spread), 1)
        }

        fog.color.copy(daylight).multiplyScalar(lerp(LIGHT.fog, light))
    }

    // Seeded and then left alone: a sun creeping across the sky reads as wrong
    // rather than as time passing, so it only varies between visits.
    placeSun((seed % 10_000) / 10_000)

    const resize = () => {
        const width = window.innerWidth
        const height = window.innerHeight
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
    }
    resize()

    const stillPreferred = window.matchMedia('(prefers-reduced-motion: reduce)')

    let frame = 0
    let last = performance.now()

    const tick = (now: number) => {
        const delta = Math.min((now - last) / 1000, 0.1)
        last = now

        drift.position.x = (drift.position.x + SPEED * delta) % TILE
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
        geometry.dispose()
        material.dispose()
        solidGeometry.dispose()
        bodyMaterial.dispose()
        groundGeometry.dispose()
        groundSolid.dispose()
        groundMaterial.dispose()
        discGeometry.dispose()
        discMaterial.dispose()
        haloGeometry.dispose()
        haloMaterial.dispose()
        ambientGeometry.dispose()
        ambientMaterial.dispose()
        scatterGeometry.dispose()
        scatterMaterial.dispose()
        haloMap?.dispose()
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
        })

        return () => {
            cancelled = true
            teardown?.()
        }
    }, [])

    return <canvas ref={canvasRef} class="pixel-sky" aria-hidden="true" />
}
