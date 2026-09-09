type Three = typeof import('./three-subset')

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
    halo: [0.72, 1],
    disc: [0.9, 1],
    ambient: [0.08, 0.7],
    scatter: [0.3, 0.62],
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

const TAU = Math.PI * 2
const radians = (degrees: number) => degrees * Math.PI / 180
const lerp = (range: readonly [number, number], t: number) => range[0] + (range[1] - range[0]) * t

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

/** Build and place the sun once; its light level also drives clouds and ground. */
export function createSun(THREE: Three, camera: InstanceType<Three['PerspectiveCamera']>, seed: number) {
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

    const warm = new THREE.Color(SUNSET.low)
    const pale = new THREE.Color(SUNSET.high)

    /** Places the sun on its arc and lights the scene to match its height. */
    const placeSun = (phase: number) => {
        const azimuth = radians(SUN.azimuthSwing * Math.sin(TAU * phase))
        const elevation = radians(
            SUN.elevationMid - SUN.elevationSwing * Math.cos(TAU * phase)
        )

        sun.position.set(
            camera.position.x + SUN.distance * Math.sin(azimuth) * Math.cos(elevation),
            camera.position.y + SUN.distance * Math.sin(elevation),
            camera.position.z - SUN.distance * Math.cos(azimuth) * Math.cos(elevation)
        )

        // 0 at the bottom of the arc, 1 at the top.
        const light = 0.5 - 0.5 * Math.cos(TAU * phase)

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

        return light
    }

    // Seeded and then left alone: a sun creeping across the sky reads as wrong
    // rather than as time passing, so it only varies between visits.
    const light = placeSun((seed % 10_000) / 10_000)

    return {
        group: sun,
        light,
        dispose() {
            discGeometry.dispose()
            discMaterial.dispose()
            haloGeometry.dispose()
            haloMaterial.dispose()
            ambientGeometry.dispose()
            ambientMaterial.dispose()
            scatterGeometry.dispose()
            scatterMaterial.dispose()
            haloMap?.dispose()
        }
    }
}
