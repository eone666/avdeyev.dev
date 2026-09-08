import { createLineBuffer, mulberry32, traceOutline } from './voxel'

export type TerrainOptions = {
    seed: number;
    cols: number;
    rows: number;
    /** How many discrete height steps the surface is quantised to. */
    levels: number;
    /** Noise octaves; the first is the coarsest. */
    octaves?: number;
    /** Cell spacing of the coarsest octave's lattice. */
    spacing?: number;
    /**
     * Height redistribution. 1 is raw noise, which gives rolling ground all of
     * the same height. Above 1 pushes most of the map down and leaves a few
     * peaks standing — plains with mountains rather than uniform bumps.
     */
    exponent?: number;
    /**
     * Folds each octave around its midpoint, turning round blobs into ridges.
     * Reads as mountain ranges instead of hills.
     */
    ridged?: boolean;
    /**
     * Flattens a disc of the map, so a camera parked there can never end up
     * inside a peak. Heights ramp smoothly from nothing at `inner` to full at
     * `outer`, both in cells, which reads as a valley rather than a hole.
     */
    clearing?: {
        x: number;
        z: number;
        inner: number;
        outer: number;
    };
}

export type Terrain = {
    cols: number;
    rows: number;
    levels: number;
    /** Integer height per cell, 0 to levels - 1. */
    heights: Uint8Array;
}

const smoothstep = (t: number) => t * t * (3 - 2 * t)

/** Bilinear value noise from a random lattice, smoothstepped. */
function addOctave(
    out: Float32Array,
    rnd: () => number,
    cols: number,
    rows: number,
    spacing: number,
    amplitude: number,
    ridged: boolean
) {
    const width = Math.ceil(cols / spacing) + 2
    const depth = Math.ceil(rows / spacing) + 2
    const lattice = new Float32Array(width * depth)
    for (let i = 0; i < lattice.length; i++) lattice[i] = rnd()

    for (let z = 0; z < rows; z++) {
        const gz = z / spacing
        const z0 = Math.floor(gz)
        const tz = smoothstep(gz - z0)

        for (let x = 0; x < cols; x++) {
            const gx = x / spacing
            const x0 = Math.floor(gx)
            const tx = smoothstep(gx - x0)

            const a = lattice[x0 + z0 * width]
            const b = lattice[x0 + 1 + z0 * width]
            const c = lattice[x0 + (z0 + 1) * width]
            const d = lattice[x0 + 1 + (z0 + 1) * width]

            const near = a + (b - a) * tx
            const far = c + (d - c) * tx
            const value = near + (far - near) * tz

            out[x + z * cols] += (ridged ? 1 - Math.abs(2 * value - 1) : value) * amplitude
        }
    }
}

/** Fractal value noise, quantised to integer voxel heights. */
export function generateTerrain({
    seed,
    cols,
    rows,
    levels,
    octaves = 4,
    spacing = 48,
    exponent = 1,
    ridged = false,
    clearing
}: TerrainOptions): Terrain {
    const rnd = mulberry32(seed)
    const raw = new Float32Array(cols * rows)

    let amplitude = 1
    for (let octave = 0; octave < octaves; octave++) {
        addOctave(
            raw,
            rnd,
            cols,
            rows,
            Math.max(1, spacing / 2 ** octave),
            amplitude,
            ridged
        )
        amplitude /= 2
    }

    let min = Infinity
    let max = -Infinity
    for (const value of raw) {
        if (value < min) min = value
        if (value > max) max = value
    }

    const span = max - min || 1
    const heights = new Uint8Array(cols * rows)
    for (let i = 0; i < raw.length; i++) {
        const normalised = (raw[i] - min) / span
        const shaped = exponent === 1 ? normalised : normalised ** exponent

        let scale = 1
        if (clearing) {
            const dx = (i % cols) - clearing.x
            const dz = Math.floor(i / cols) - clearing.z
            const distance = Math.sqrt(dx * dx + dz * dz)
            const ramp = (distance - clearing.inner) / (clearing.outer - clearing.inner)

            scale = smoothstep(Math.min(1, Math.max(0, ramp)))
        }

        heights[i] = Math.min(levels - 1, Math.floor(shaped * scale * levels))
    }

    return { cols, rows, levels, heights }
}

export type TerrainWireframeOptions = {
    /** Cell size in world units. */
    cell: number;
    /** Height of one level in world units. */
    step: number;
}

/**
 * Traces one contour per height level and drops a riser at each contour
 * corner, so the surface reads as stepped voxel terraces rather than as
 * floating rings. Flat ground draws nothing, which is what keeps it sparse.
 *
 * Returns a flat [x, y, z, x, y, z, ...] list of line-segment endpoints.
 */
export function buildTerrainWireframe(
    { cols, rows, levels, heights }: Terrain,
    { cell, step }: TerrainWireframeOptions
) {
    const { positions, line } = createLineBuffer()

    for (let level = 1; level < levels; level++) {
        const segments = traceOutline(
            (x, z) =>
                x >= 0 && x < cols &&
                z >= 0 && z < rows &&
                heights[x + z * cols] >= level,
            cols,
            rows
        )

        const y = level * step
        const struts = new Set<number>()

        for (const { x1, z1, x2, z2 } of segments) {
            line(x1 * cell, y, z1 * cell, x2 * cell, y, z2 * cell)
            struts.add(x1 + z1 * (cols + 1))
            struts.add(x2 + z2 * (cols + 1))
        }

        for (const key of struts) {
            const x = key % (cols + 1)
            const z = Math.floor(key / (cols + 1))
            line(x * cell, y - step, z * cell, x * cell, y, z * cell)
        }
    }

    return positions
}

/** The four in-plane neighbours, as [dx, dz] plus the wall's fixed axis. */
const NEIGHBOURS = [
    { dx: -1, dz: 0, axis: 'x' as const, at: 0 },
    { dx: 1, dz: 0, axis: 'x' as const, at: 1 },
    { dx: 0, dz: -1, axis: 'z' as const, at: 0 },
    { dx: 0, dz: 1, axis: 'z' as const, at: 1 }
]

/**
 * The terrain as a closed solid: top faces merged along x, plus a wall
 * wherever a neighbour sits lower (off the field counts as the base, so the
 * edges are capped too).
 *
 * Drawn in the page's background colour like the cloud body — invisible, but
 * it writes depth, so mountains hide the sun and stop the far wireframe from
 * showing through them.
 *
 * Returns a flat [x, y, z, ...] triangle list.
 */
export function buildTerrainSolid(
    { cols, rows, heights }: Terrain,
    { cell, step }: TerrainWireframeOptions
) {
    const positions: number[] = []

    type Point = readonly [number, number, number]
    const quad = (a: Point, b: Point, c: Point, d: Point) => {
        positions.push(...a, ...b, ...c, ...a, ...c, ...d)
    }

    const at = (x: number, z: number) => heights[x + z * cols]
    const outside = (x: number, z: number) => x < 0 || x >= cols || z < 0 || z >= rows

    for (let z = 0; z < rows; z++) {
        let start = 0

        for (let x = 1; x <= cols; x++) {
            if (x < cols && at(x, z) === at(start, z)) continue

            const y = at(start, z) * step
            quad(
                [start * cell, y, z * cell],
                [x * cell, y, z * cell],
                [x * cell, y, (z + 1) * cell],
                [start * cell, y, (z + 1) * cell]
            )
            start = x
        }
    }

    for (let z = 0; z < rows; z++) {
        for (let x = 0; x < cols; x++) {
            const height = at(x, z)
            const top = height * step

            for (const { dx, dz, axis, at: side } of NEIGHBOURS) {
                const nx = x + dx
                const nz = z + dz
                // Off the field drops to the base, which caps the edges.
                const neighbour = outside(nx, nz) ? 0 : at(nx, nz)
                if (neighbour >= height) continue

                const bottom = neighbour * step

                if (axis === 'x') {
                    const wx = (x + side) * cell
                    quad(
                        [wx, bottom, z * cell],
                        [wx, bottom, (z + 1) * cell],
                        [wx, top, (z + 1) * cell],
                        [wx, top, z * cell]
                    )
                } else {
                    const wz = (z + side) * cell
                    quad(
                        [x * cell, bottom, wz],
                        [(x + 1) * cell, bottom, wz],
                        [(x + 1) * cell, top, wz],
                        [x * cell, top, wz]
                    )
                }
            }
        }
    }

    return positions
}
