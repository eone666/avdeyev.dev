/** A run of an outline, in cell units, on the xz plane. */
export type Segment = {
    x1: number;
    z1: number;
    x2: number;
    z2: number;
}

/** mulberry32: small, fast, and deterministic for a given seed. */
export function mulberry32(seed: number) {
    let state = seed | 0

    return function next() {
        state = (state + 0x6d2b79f5) | 0
        let t = Math.imul(state ^ (state >>> 15), 1 | state)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

export const mod = (n: number, m: number) => ((n % m) + m) % m

/** A fresh seed per call, so every page load gets a different landscape. */
export function randomSeed() {
    return Math.floor(Math.random() * 0x7fffffff)
}

/**
 * Traces the boundary between filled and empty cells, merging collinear edges
 * into single runs. Interior edges are left out, so a blob comes back as its
 * silhouette rather than a lattice.
 *
 * Shared by the clouds (one filled set) and the terrain (one set per height
 * level, which makes the outlines read as terraces).
 *
 * `isFilled` is asked about cells one step outside the field, and owns what
 * happens there: the clouds wrap along x so their tile has no seam, the
 * terrain reports empty so it gets a closed edge. A predicate that answers
 * `true` out of range silently loses that side of the outline.
 */
export function traceOutline(
    isFilled: (x: number, z: number) => boolean,
    cols: number,
    rows: number
): Segment[] {
    // Group edges by the line they sit on, so neighbours can be merged.
    const alongX = new Map<number, number[]>()
    const alongZ = new Map<number, number[]>()
    const push = (map: Map<number, number[]>, line: number, pos: number) => {
        const list = map.get(line)
        if (list) list.push(pos)
        else map.set(line, [pos])
    }

    for (let z = 0; z < rows; z++) {
        for (let x = 0; x < cols; x++) {
            if (!isFilled(x, z)) continue
            if (!isFilled(x, z - 1)) push(alongX, z, x)
            if (!isFilled(x, z + 1)) push(alongX, z + 1, x)
            if (!isFilled(x - 1, z)) push(alongZ, x, z)
            if (!isFilled(x + 1, z)) push(alongZ, x + 1, z)
        }
    }

    const segments: Segment[] = []
    const emit = (
        map: Map<number, number[]>,
        make: (line: number, start: number, length: number) => Segment
    ) => {
        for (const [line, positions] of [...map].sort((a, b) => a[0] - b[0])) {
            positions.sort((a, b) => a - b)
            let start = positions[0]
            let length = 1

            for (let i = 1; i < positions.length; i++) {
                if (positions[i] === start + length) {
                    length++
                    continue
                }
                segments.push(make(line, start, length))
                start = positions[i]
                length = 1
            }

            segments.push(make(line, start, length))
        }
    }

    emit(alongX, (z, x, len) => ({ x1: x, z1: z, x2: x + len, z2: z }))
    emit(alongZ, (x, z, len) => ({ x1: x, z1: z, x2: x, z2: z + len }))

    return segments
}

/** Collects a flat [x, y, z, x, y, z, ...] list of line endpoints. */
export function createLineBuffer() {
    const positions: number[] = []

    return {
        positions,
        line(
            x1: number, y1: number, z1: number,
            x2: number, y2: number, z2: number
        ) {
            positions.push(x1, y1, z1, x2, y2, z2)
        }
    }
}
