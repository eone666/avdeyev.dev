import { expect, test, describe } from 'bun:test'
import { buildWireframe, generateCloudField } from './clouds'

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
