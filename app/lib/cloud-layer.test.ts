import { expect, test } from 'bun:test'
import * as THREE from './three-subset'
import { createCloudLayer } from './cloud-layer'
import { cloudWind } from './clouds'

test('cloud rows cover the view through forward and backward depth wrapping', () => {
    const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 3000)
    camera.position.set(0, -80, 40)
    camera.rotation.x = 11 * Math.PI / 180
    const body = new THREE.MeshBasicMaterial()
    for (const seed of [1, 2, 42, 100]) {
        const clouds = createCloudLayer(THREE, seed, body, 0xbef202)
        const wind = cloudWind(seed, 1.3)
        const period = 2640 / Math.abs(wind.z)
        clouds.resize(camera)
        for (const delta of [0, 0.01, period - 0.02, 0.02, period * 3]) {
            clouds.update(delta, camera)
            const rows = [...new Set(clouds.group.children.map((tile) =>
                tile.position.z + clouds.group.position.z))].sort((a, b) => a - b)
            expect(rows[0]).toBeLessThan(camera.position.z - 2400)
            expect(rows.at(-1)! + 240).toBeGreaterThan(camera.position.z + 80)
            for (let index = 1; index < rows.length; index++) {
                expect(rows[index] - rows[index - 1]).toBeCloseTo(240, 8)
            }
        }
        clouds.dispose()
    }
    body.dispose()
})
