import { createLineBuffer, mod, mulberry32, traceOutline, type Segment } from './voxel'

export type CloudFieldOptions = {
    seed: number;
    /** Field width in cells. The field tiles seamlessly along x. */
    cols: number;
    /** Field depth in cells. */
    rows: number;
    /** Repeat seamlessly in depth as well, for diagonal drift. */
    wrapZ?: boolean;
    /** How many cloud blobs to scatter. */
    count: number;
    /** How many one-to-two cell specks to scatter between the blobs. */
    specks?: number;
    /**
     * Thins the field out towards low z. 1 scatters evenly; above 1 crowds the
     * clouds at the high-z end, so a shallow slab trails off instead of ending
     * at a visible straight edge.
     */
    taper?: number;
}

/** A horizontal strip of filled cells in one row; x2 is exclusive. */
export type Run = {
    z: number;
    x1: number;
    x2: number;
}

export type CloudField = {
    cols: number;
    rows: number;
    /** Outline runs only — no interior edges. */
    segments: Segment[];
    /** Filled cells merged along x, for building the solid. */
    runs: Run[];
    /** Share of cells that are cloud, 0 to 1. The thing to tune density by. */
    coverage: number;
}

/**
 * Scatters axis-aligned rectangles into blobs — Minecraft's clouds are boxy,
 * and a union of rectangles gives that silhouette for free — then traces the
 * boundary between filled and empty cells.
 *
 * The x axis wraps, so the field can repeat end to end with no seam.
 */
export function generateCloudField({
    seed,
    cols,
    rows,
    count,
    specks = 0,
    taper = 1,
    wrapZ = false
}: CloudFieldOptions): CloudField {
    const rnd = mulberry32(seed)
    const filled = new Set<number>()
    const at = (x: number, z: number) => mod(x, cols) + (wrapZ ? mod(z, rows) : z) * cols
    const taperedZ = () =>
        Math.min(rows - 1, Math.floor(rows * (1 - rnd() ** taper)))

    for (let i = 0; i < count; i++) {
        const cx = Math.floor(rnd() * cols)
        const cz = taperedZ()
        const parts = 3 + Math.floor(rnd() * 4)

        for (let p = 0; p < parts; p++) {
            const w = 3 + Math.floor(rnd() * 8)
            const d = 2 + Math.floor(rnd() * 4)
            const ox = Math.floor(rnd() * 7) - 3
            const oz = Math.floor(rnd() * 5) - 2

            for (let z = cz + oz; z < cz + oz + d; z++) {
                if (!wrapZ && (z < 0 || z >= rows)) continue
                for (let x = cx + ox; x < cx + ox + w; x++) {
                    filled.add(at(x, z))
                }
            }
        }
    }

    // Minecraft's cloud layer is littered with single blocks between the big
    // masses; without them the field reads as too orderly.
    for (let i = 0; i < specks; i++) {
        const x = Math.floor(rnd() * cols)
        const z = taperedZ()
        const w = 1 + Math.floor(rnd() * 2)
        const d = 1 + Math.floor(rnd() * 2)

        for (let sz = z; sz < z + d && (wrapZ || sz < rows); sz++) {
            for (let sx = x; sx < x + w; sx++) {
                filled.add(at(sx, sz))
            }
        }
    }

    const segments = traceOutline(
        (x, z) => (wrapZ || (z >= 0 && z < rows)) && filled.has(at(x, z)),
        cols,
        rows
    )

    // Merge each row into strips. Not wrapped: tiles abut exactly, so a strip
    // split at the tile edge is invisible.
    const runs: Run[] = []
    for (let z = 0; z < rows; z++) {
        let start = -1

        for (let x = 0; x <= cols; x++) {
            const inside = x < cols && filled.has(at(x, z))

            if (inside && start === -1) start = x
            else if (!inside && start !== -1) {
                runs.push({ z, x1: start, x2: x })
                start = -1
            }
        }
    }

    return { cols, rows, segments, runs, coverage: filled.size / (cols * rows) }
}

export type WireframeOptions = {
    /** Cell size in world units. */
    cell: number;
    /** Slab thickness in world units — Minecraft's cloud layer is a slab. */
    thickness: number;
}

/**
 * Extrudes the outline into a wireframe slab: the outline traced at the top
 * and the bottom, plus a vertical strut at every corner.
 *
 * Returns a flat [x, y, z, x, y, z, ...] list of line-segment endpoints.
 */
export function buildWireframe(field: CloudField, { cell, thickness }: WireframeOptions) {
    const { positions, line } = createLineBuffer()
    const top = thickness / 2
    const bottom = -thickness / 2
    const struts = new Set<number>()

    for (const { x1, z1, x2, z2 } of field.segments) {
        line(x1 * cell, top, z1 * cell, x2 * cell, top, z2 * cell)
        line(x1 * cell, bottom, z1 * cell, x2 * cell, bottom, z2 * cell)

        struts.add(x1 + z1 * (field.cols + 1))
        struts.add(x2 + z2 * (field.cols + 1))
    }

    for (const key of struts) {
        const x = key % (field.cols + 1)
        const z = Math.floor(key / (field.cols + 1))
        line(x * cell, bottom, z * cell, x * cell, top, z * cell)
    }

    return positions
}

/**
 * The same slab as a closed solid: top and bottom faces from the strips, side
 * walls from the outline.
 *
 * Drawn in the page's own background colour, so it stays invisible while
 * writing depth — which is what lets the clouds hide the sun instead of
 * everything showing through everything.
 *
 * Returns a flat [x, y, z, ...] triangle list.
 */
export function buildSolid(field: CloudField, { cell, thickness }: WireframeOptions) {
    const positions: number[] = []
    const top = thickness / 2
    const bottom = -thickness / 2

    type Point = readonly [number, number, number]
    const quad = (a: Point, b: Point, c: Point, d: Point) => {
        positions.push(...a, ...b, ...c, ...a, ...c, ...d)
    }

    for (const { z, x1, x2 } of field.runs) {
        const xa = x1 * cell
        const xb = x2 * cell
        const za = z * cell
        const zb = (z + 1) * cell

        quad([xa, top, za], [xb, top, za], [xb, top, zb], [xa, top, zb])
        quad([xa, bottom, za], [xb, bottom, za], [xb, bottom, zb], [xa, bottom, zb])
    }

    for (const { x1, z1, x2, z2 } of field.segments) {
        const ax = x1 * cell
        const az = z1 * cell
        const bx = x2 * cell
        const bz = z2 * cell

        quad([ax, bottom, az], [bx, bottom, bz], [bx, top, bz], [ax, top, az])
    }

    return positions
}

/** A steady horizontal wind, with a small angle towards or away from the viewer. */
export function cloudWind(seed: number, speed: number) {
    const rnd = mulberry32(seed ^ 0x57494e44)
    const direction = rnd() < 0.5 ? -1 : 1
    const angle = (rnd() * 2 - 1) * Math.PI / 6
    return { x: direction * Math.cos(angle) * speed, z: Math.sin(angle) * speed }
}
