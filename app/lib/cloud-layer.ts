import { buildCloudChunks, cloudWind, generateCloudField } from './clouds'
import { mod } from './voxel'

type Three = typeof import('./three-subset')
type Camera = InstanceType<Three['PerspectiveCamera']>

const FIELD = { cols: 96, rows: 660, count: 570, specks: 900, wrapZ: true }
const CELL = 4
const CHUNK_ROWS = 60
const CHUNK_DEPTH = CHUNK_ROWS * CELL
const WIDTH = FIELD.cols * CELL
const DEPTH = FIELD.rows * CELL
const OVERHEAD = 80
const FADE_START = 1200
const FADE_END = 2400

/** Shared geometry in short depth sections, repeated only around the view. */
export function createCloudLayer(
    THREE: Three,
    seed: number,
    bodyMaterial: InstanceType<Three['MeshBasicMaterial']>,
    color: number,
    multisampled = false
) {
    const group = new THREE.Group()
    const wind = cloudWind(seed, 1.3)
    const material = new THREE.LineBasicMaterial({
        color, transparent: true, blending: THREE.AdditiveBlending,
        depthWrite: false, opacity: 0.34
    })
    const body = bodyMaterial.clone()
    body.fog = true
    body.alphaToCoverage = multisampled

    const fade = `float cloudFade = 1.0 - smoothstep(${FADE_START.toFixed(1)}, ${FADE_END.toFixed(1)}, vFogDepth);`
    material.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace('#include <fog_fragment>', `
            #ifdef USE_FOG
                ${fade}
                // Perspective packs more outlines into each distant pixel.
                // Attenuate them so the horizon does not become a neon band.
                float distanceFade = min(1.0, 400.0 / max(vFogDepth, 1.0));
                gl_FragColor.a *= cloudFade * distanceFade * distanceFade;
            #endif
        `)
    }
    body.onBeforeCompile = (shader) => {
        // MSAA fades depth coverage as well as colour, without a moving
        // screen-door pattern. Ordered coverage is only a fallback for GPUs
        // that did not provide a multisampled drawing buffer.
        shader.fragmentShader = shader.fragmentShader.replace('#include <fog_fragment>', `
            #ifdef USE_FOG
                ${fade}
                ${multisampled ? 'gl_FragColor.a *= cloudFade;' : `
                vec2 pixel = floor(gl_FragCoord.xy);
                vec2 low = mod(pixel, 2.0);
                vec2 high = mod(floor(pixel / 2.0), 2.0);
                float threshold = (4.0 * mod(2.0 * low.x + 3.0 * low.y, 4.0)
                    + mod(2.0 * high.x + 3.0 * high.y, 4.0) + 0.5) / 16.0;
                if (cloudFade <= threshold) discard;
                `}
            #endif
        `)
    }
    body.customProgramCacheKey = () => `cloud-depth-fade-${multisampled}`

    const buffer = (positions: number[]) => {
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        geometry.computeBoundingSphere()
        return geometry
    }
    const chunks = buildCloudChunks(generateCloudField({ ...FIELD, seed }), { cell: CELL, thickness: 3 }, CHUNK_ROWS)
        .map(({ solid, wireframe }) => ({ solid: buffer(solid), wireframe: buffer(wireframe) }))

    let layoutKey = ''
    const layout = (camera: Camera) => {
        // Fog uses camera-space depth. Account for pitch and the slab's height
        // when finding the furthest world-space row that can still be visible.
        const pitch = camera.rotation.x
        const distance = (FADE_END + Math.abs(camera.position.y) * Math.abs(Math.sin(pitch))) / Math.cos(pitch)
        const first = Math.floor((camera.position.z - distance - OVERHEAD - group.position.z) / CHUNK_DEPTH)
        const last = Math.ceil((camera.position.z - group.position.z) / CHUNK_DEPTH)
        const halfWidth = FADE_END * Math.tan(camera.fov * Math.PI / 360) * camera.aspect
        const radius = Math.ceil(halfWidth / WIDTH) + 1
        const key = `${first}:${last}:${radius}`
        if (key === layoutKey) return
        layoutKey = key

        // Reuse mesh objects when a row wraps or the viewport changes.
        let used = 0
        for (let row = first; row <= last; row++) {
            const chunk = chunks[mod(row, chunks.length)]
            for (let col = -radius; col <= radius; col++) {
                let tile = group.children[used++] as InstanceType<Three['Group']> | undefined
                if (!tile) {
                    tile = new THREE.Group()
                    tile.add(new THREE.Mesh(chunk.solid, body), new THREE.LineSegments(chunk.wireframe, material))
                    group.add(tile)
                }
                const mesh = tile.children[0] as InstanceType<Three['Mesh']>
                const lines = tile.children[1] as InstanceType<Three['LineSegments']>
                mesh.geometry = chunk.solid
                lines.geometry = chunk.wireframe
                tile.position.set(col * WIDTH - WIDTH / 2, 0, OVERHEAD + row * CHUNK_DEPTH)
            }
        }
        for (const tile of group.children.slice(used)) group.remove(tile)
    }

    return {
        group,
        material,
        resize: layout,
        update(delta: number, camera: Camera) {
            group.position.x = mod(group.position.x + wind.x * delta, WIDTH)
            group.position.z = mod(group.position.z + wind.z * delta, DEPTH)
            layout(camera)
        },
        dispose() {
            for (const chunk of chunks) {
                chunk.solid.dispose()
                chunk.wireframe.dispose()
            }
            group.clear()
            material.dispose()
            body.dispose()
        }
    }
}
