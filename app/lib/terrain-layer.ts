import { buildTerrainSolid, buildTerrainWireframe, generateTerrain } from './terrain'

type Three = typeof import('./three-subset')
type Camera = InstanceType<Three['PerspectiveCamera']>

/** Detailed foreground backed by a coarser range reaching the sky's horizon. */
export function createTerrainLayer(
    THREE: Three, camera: Camera, seed: number,
    body: InstanceType<Three['MeshBasicMaterial']>, color: number
) {
    const group = new THREE.Group()
    const foregroundOrigin = { x: -480, z: -480 }
    const foreground = generateTerrain({
        seed: seed + 1, cols: 120, rows: 70, levels: 16,
        spacing: 24, octaves: 3, exponent: 2.2, ridged: true,
        clearing: {
            x: (camera.position.x - foregroundOrigin.x) / 8,
            z: (camera.position.z - foregroundOrigin.z) / 8,
            inner: 10, outer: 24
        }
    })
    const distant = generateTerrain({
        seed: seed + 2, cols: 192, rows: 80, levels: 16,
        spacing: 28, octaves: 2, exponent: 1.3, ridged: true
    })
    // Lower the near edge into the foreground instead of exposing a cliff
    // where the coarse grid starts. Both layers overlap by 160 world units.
    for (let z = distant.rows - 6; z < distant.rows; z++) {
        const t = (distant.rows - 1 - z) / 5
        for (let x = 0; x < distant.cols; x++) {
            distant.heights[x + z * distant.cols] = Math.floor(
                distant.heights[x + z * distant.cols] * t * t * (3 - 2 * t)
            )
        }
    }

    const material = new THREE.LineBasicMaterial({
        color, transparent: true, blending: THREE.AdditiveBlending,
        depthWrite: false, opacity: 0.2
    })
    const distantMaterial = material.clone()
    distantMaterial.onBeforeCompile = (shader) => {
        // The foreground fog ends at 430, long before the distant ridges.
        // Fade the background contours to black only near the far clip.
        shader.fragmentShader = shader.fragmentShader.replace('#include <fog_fragment>', `
            #ifdef USE_FOG
                gl_FragColor.a *= 1.0 - smoothstep(1400.0, 2800.0, vFogDepth);
            #endif
        `)
    }

    const geometries: InstanceType<Three['BufferGeometry']>[] = []
    const geometry = (positions: number[]) => {
        const result = new THREE.BufferGeometry()
        result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        geometries.push(result)
        return result
    }
    const layer = (
        terrain: typeof foreground, cell: number, step: number,
        lines: typeof material, x: number, y: number, z: number
    ) => {
        const result = new THREE.Group()
        result.add(
            new THREE.Mesh(geometry(buildTerrainSolid(terrain, { cell, step })), body),
            new THREE.LineSegments(geometry(buildTerrainWireframe(terrain, { cell, step })), lines)
        )
        result.position.set(x, y, z)
        group.add(result)
        return result
    }
    const background = layer(distant, 32, 8, distantMaterial, -3072, -135, -2880)
    layer(foreground, 8, 7, material, foregroundOrigin.x, -134, foregroundOrigin.z)

    return {
        group, material, distantMaterial,
        resize() {
            // Keep the remote skyline across ultrawide viewports as well.
            const halfWidth = camera.far * Math.tan(camera.fov * Math.PI / 360) * camera.aspect
            const scale = Math.max(1, halfWidth / 3072)
            background.scale.x = scale
            background.position.x = -3072 * scale
        },
        dispose() {
            for (const item of geometries) item.dispose()
            material.dispose()
            distantMaterial.dispose()
            group.clear()
        }
    }
}
