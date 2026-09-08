import { expect, test, describe } from 'bun:test'
import { buildTerrainWireframe, generateTerrain } from './terrain'

const opts = { seed: 1, cols: 64, rows: 40, levels: 8, spacing: 16 }

describe('terrain', () => {
    test('is deterministic for a given seed', () => {
        expect(generateTerrain(opts).heights).toEqual(generateTerrain(opts).heights)
    })

    test('differs between seeds', () => {
        expect(generateTerrain(opts).heights).not.toEqual(
            generateTerrain({ ...opts, seed: 2 }).heights
        )
    })

    test('quantises every cell into range', () => {
        const { heights, cols, rows, levels } = generateTerrain(opts)

        expect(heights).toHaveLength(cols * rows)
        for (const height of heights) {
            expect(height).toBeGreaterThanOrEqual(0)
            expect(height).toBeLessThan(levels)
        }
    })

    test('uses the full height range', () => {
        const { heights, levels } = generateTerrain(opts)

        expect(Math.min(...heights)).toBe(0)
        expect(Math.max(...heights)).toBe(levels - 1)
    })

    test('coarser noise gives smoother ground', () => {
        const relief = (spacing: number) => {
            const { heights, cols, rows } = generateTerrain({ ...opts, spacing })
            let steps = 0

            for (let z = 0; z < rows; z++) {
                for (let x = 1; x < cols; x++) {
                    if (heights[x + z * cols] !== heights[x - 1 + z * cols]) steps++
                }
            }

            return steps
        }

        expect(relief(48)).toBeLessThan(relief(8))
    })
})

describe('clearing', () => {
    const clearing = { x: 32, z: 20, inner: 6, outer: 16 }

    test('flattens the disc completely, on every seed', () => {
        for (let seed = 1; seed <= 60; seed++) {
            const { heights, cols } = generateTerrain({ ...opts, seed, clearing })

            for (let dz = -clearing.inner; dz <= clearing.inner; dz++) {
                for (let dx = -clearing.inner; dx <= clearing.inner; dx++) {
                    if (Math.sqrt(dx * dx + dz * dz) > clearing.inner) continue

                    const height = heights[clearing.x + dx + (clearing.z + dz) * cols]
                    expect(height).toBe(0)
                }
            }
        }
    })

    test('leaves ground beyond the ramp untouched', () => {
        const plain = generateTerrain(opts)
        const cleared = generateTerrain({ ...opts, clearing })
        const { cols } = plain

        let compared = 0
        for (let z = 0; z < plain.rows; z++) {
            for (let x = 0; x < cols; x++) {
                const dx = x - clearing.x
                const dz = z - clearing.z
                if (Math.sqrt(dx * dx + dz * dz) <= clearing.outer) continue

                expect(cleared.heights[x + z * cols]).toBe(plain.heights[x + z * cols])
                compared++
            }
        }

        expect(compared).toBeGreaterThan(0)
    })

    test('ramps up rather than cutting a step', () => {
        const { heights, cols } = generateTerrain({ ...opts, clearing })
        const along = (d: number) => heights[clearing.x + d + clearing.z * cols]

        // Monotone non-decreasing across the ramp is not guaranteed by the
        // noise, but the ramp must not jump the full height in one cell.
        for (let d = clearing.inner; d < clearing.outer; d++) {
            expect(Math.abs(along(d + 1) - along(d))).toBeLessThan(opts.levels - 1)
        }
    })
})

describe('terrain wireframe', () => {
    const terrain = generateTerrain(opts)
    const positions = buildTerrainWireframe(terrain, { cell: 4, step: 3 })

    test('is a whole number of line segments', () => {
        expect(positions.length % 6).toBe(0)
        expect(positions.length).toBeGreaterThan(0)
    })

    test('sits on the level grid, from the ground up', () => {
        const ys = positions.filter((_, i) => i % 3 === 1)

        for (const y of ys) {
            expect(y % 3).toBe(0)
            expect(y).toBeGreaterThanOrEqual(0)
            expect(y).toBeLessThanOrEqual((opts.levels - 1) * 3)
        }
    })

    test('stays within the field footprint', () => {
        for (let i = 0; i < positions.length; i += 3) {
            expect(positions[i]).toBeGreaterThanOrEqual(0)
            expect(positions[i]).toBeLessThanOrEqual(opts.cols * 4)
            expect(positions[i + 2]).toBeGreaterThanOrEqual(0)
            expect(positions[i + 2]).toBeLessThanOrEqual(opts.rows * 4)
        }
    })

    test('draws nothing for perfectly flat ground', () => {
        const flat = { ...generateTerrain(opts), heights: new Uint8Array(64 * 40) }

        expect(buildTerrainWireframe(flat, { cell: 4, step: 3 })).toEqual([])
    })
})
