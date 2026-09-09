import { expect, test, describe } from 'bun:test'
import { buildCloudChunks, buildSolid, buildWireframe, cloudWind, generateCloudField } from './clouds'

const opts = { seed: 1, cols: 40, rows: 12, count: 5 }

describe('cloud field', () => {
    test('is deterministic for a given seed', () => {
        expect(generateCloudField(opts)).toEqual(generateCloudField(opts))
    })

    test('differs between seeds', () => {
        expect(generateCloudField(opts).segments).not.toEqual(
            generateCloudField({ ...opts, seed: 2 }).segments
        )
    })

    test('produces an outline', () => {
        const field = generateCloudField(opts)

        expect(field.segments.length).toBeGreaterThan(0)
        expect(field.cols).toBe(40)
        expect(field.rows).toBe(12)
    })

    test('reports coverage, and specks raise it', () => {
        const bare = generateCloudField({ ...opts, specks: 0 })
        const speckled = generateCloudField({ ...opts, specks: 40 })

        expect(bare.coverage).toBeGreaterThan(0)
        expect(bare.coverage).toBeLessThan(1)
        expect(speckled.coverage).toBeGreaterThan(bare.coverage)
    })

    test('emits only axis-aligned runs of non-zero length', () => {
        for (const { x1, z1, x2, z2 } of generateCloudField(opts).segments) {
            const horizontal = z1 === z2 && x2 > x1
            const vertical = x1 === x2 && z2 > z1

            expect(horizontal || vertical).toBe(true)
        }
    })

    test('stays inside the tile so it can repeat without a seam', () => {
        const { cols, rows, segments } = generateCloudField(opts)

        for (const { x1, z1, x2, z2 } of segments) {
            expect(Math.min(x1, x2)).toBeGreaterThanOrEqual(0)
            expect(Math.max(x1, x2)).toBeLessThanOrEqual(cols)
            expect(Math.min(z1, z2)).toBeGreaterThanOrEqual(0)
            expect(Math.max(z1, z2)).toBeLessThanOrEqual(rows)
        }
    })
})

describe('wireframe', () => {
    const field = generateCloudField(opts)
    const positions = buildWireframe(field, { cell: 4, thickness: 3 })

    test('is a whole number of line segments', () => {
        // 3 floats per vertex, 2 vertices per segment.
        expect(positions.length % 6).toBe(0)
        expect(positions.length).toBeGreaterThan(0)
    })

    test('traces the outline at both faces of the slab', () => {
        const ys = new Set(positions.filter((_, i) => i % 3 === 1))

        expect([...ys].sort((a, b) => a - b)).toEqual([-1.5, 1.5])
    })

    test('scales with the cell size', () => {
        const wider = buildWireframe(field, { cell: 8, thickness: 3 })
        const xs = (list: number[]) => list.filter((_, i) => i % 3 === 0)

        expect(Math.max(...xs(wider))).toBe(Math.max(...xs(positions)) * 2)
    })
})

describe('diagonal cloud drift', () => {
    test('keeps speed constant and varies direction within 30 degrees', () => {
        const winds = Array.from({ length: 100 }, (_, seed) => cloudWind(seed, 1.3))
        expect(cloudWind(42, 1.3)).toEqual(cloudWind(42, 1.3))
        for (const wind of winds) {
            expect(Math.hypot(wind.x, wind.z)).toBeCloseTo(1.3, 10)
            expect(Math.abs(Math.atan(wind.z / wind.x))).toBeLessThanOrEqual(Math.PI / 6)
        }
        expect(winds.some(({ x }) => x < 0)).toBe(true)
        expect(winds.some(({ x }) => x > 0)).toBe(true)
        expect(winds.some(({ z }) => z < 0)).toBe(true)
        expect(winds.some(({ z }) => z > 0)).toBe(true)
    })

    test('depth tile joins have outlines only where occupancy changes', () => {
        for (let seed = 0; seed < 20; seed++) {
            const field = generateCloudField({ ...opts, seed, wrapZ: true, specks: 40 })
            const filled = (x: number, z: number) =>
                field.runs.some((run) => run.z === z && x >= run.x1 && x < run.x2)
            for (let x = 0; x < field.cols; x++) {
                const edges = field.segments.filter(({ x1, x2, z1, z2 }) =>
                    z1 === z2 && (z1 === 0 || z1 === field.rows) && x >= x1 && x < x2)
                expect(edges.length).toBe(Number(filled(x, 0) !== filled(x, field.rows - 1)))
            }
        }
    })
})

test('chunking preserves every triangle and line without adding internal edges', () => {
    const field = generateCloudField({ ...opts, wrapZ: true })
    const options = { cell: 4, thickness: 3 }
    const chunks = buildCloudChunks(field, options, 3)
    const primitives = (positions: number[], stride: number) => {
        const result = []
        for (let offset = 0; offset < positions.length; offset += stride) {
            result.push(positions.slice(offset, offset + stride).join(','))
        }
        return result.sort()
    }
    for (const [key, original, stride] of [
        ['solid', buildSolid(field, options), 9],
        ['wireframe', buildWireframe(field, options), 6]
    ] as const) {
        const reconstructed = chunks.flatMap((chunk, index) =>
            chunk[key].map((value, axis) => axis % 3 === 2 ? value + index * 12 : value))
        expect(primitives(reconstructed, stride)).toEqual(primitives(original, stride))
    }
    expect(() => buildCloudChunks(field, options, 5)).toThrow()
})
