import { expect, test, describe, } from 'bun:test'
import { getRandomPhrase } from './potd-fn'

describe("Random phrase", () => {

    const phrases = ["One", "Two", "Three", "Four", "Five"] as const

    test('should select a phrase using the random value', () => {
        expect(getRandomPhrase(phrases, () => 0)).toBe("One")
        expect(getRandomPhrase(phrases, () => 0.4)).toBe("Three")
        expect(getRandomPhrase(phrases, () => 0.999)).toBe("Five")
    })

    test('should always return one of the available phrases', () => {
        expect(phrases).toContain(getRandomPhrase(phrases))
    })
})
