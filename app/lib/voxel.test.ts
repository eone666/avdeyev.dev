import { expect, test, describe } from 'bun:test'
import { mod, mulberry32, traceOutline } from './voxel'

describe('mulberry32', () => {
    test('stays in [0, 1)', () => {
        const rnd = mulberry32(42)

        for (let i = 0; i < 500; i++) {
            const value = rnd()
            expect(value).toBeGreaterThanOrEqual(0)
            expect(value).toBeLessThan(1)
        }
    })

    test('is reproducible and seed-dependent', () => {
        const first = Array.from({ length: 5 }, mulberry32(7))
        const same = Array.from({ length: 5 }, mulberry32(7))
        const other = Array.from({ length: 5 }, mulberry32(8))

        expect(first).toEqual(same)
        expect(first).not.toEqual(other)
    })
})

describe('mod', () => {
    test('wraps negatives into range', () => {
        expect(mod(-1, 4)).toBe(3)
        expect(mod(4, 4)).toBe(0)
        expect(mod(5, 4)).toBe(1)
    })
})

describe('traceOutline', () => {
    test('boxes a single cell with four edges', () => {
        const segments = traceOutline((x, z) => x === 1 && z === 1, 3, 3)

        expect(segments).toHaveLength(4)
        expect(segments).toEqual(
            expect.arrayContaining([
                { x1: 1, z1: 1, x2: 2, z2: 1 },
                { x1: 1, z1: 2, x2: 2, z2: 2 },
                { x1: 1, z1: 1, x2: 1, z2: 2 },
                { x1: 2, z1: 1, x2: 2, z2: 2 }
            ])
        )
    })

    test('merges collinear edges into one run', () => {
        // A 3x1 strip: two long runs plus two single-cell caps.
        const segments = traceOutline((x, z) => z === 0 && x >= 0 && x < 3, 3, 1)

        expect(segments).toHaveLength(4)
        expect(segments).toEqual(
            expect.arrayContaining([
                { x1: 0, z1: 0, x2: 3, z2: 0 },
                { x1: 0, z1: 1, x2: 3, z2: 1 }
            ])
        )
    })

    test('leaves out interior edges', () => {
        // A filled 4x4 block has only its perimeter: four runs.
        const segments = traceOutline(
            (x, z) => x >= 0 && x < 4 && z >= 0 && z < 4,
            4,
            4
        )

        expect(segments).toHaveLength(4)
    })

    test('a predicate that is filled out of range drops that edge', () => {
        // Documents the contract above: unbounded on the left, so the left
        // edge is never emitted.
        const bounded = traceOutline((x, z) => z === 0 && x >= 0 && x < 3, 3, 1)
        const unbounded = traceOutline((x, z) => z === 0 && x < 3, 3, 1)

        expect(unbounded).toHaveLength(bounded.length - 1)
    })

    test('returns nothing for an empty field', () => {
        expect(traceOutline(() => false, 5, 5)).toEqual([])
    })
})
