import { expect, test, describe, } from 'bun:test'
import { getPhraseOfTheDay } from './potd-fn';

describe("Phrase of The Day", () => {

    const phrases = ["One", "Two", "Three", "Four", "Five"] as const

    test('should return different phrases for different days', () => {

        let latest: typeof phrases[number] | null = null

        const potd1 = getPhraseOfTheDay(new Date(Date.UTC(2026, 0, 1)), phrases)

        expect(potd1).not.toBe(latest)

        latest = potd1

        const potd2 = getPhraseOfTheDay(new Date(Date.UTC(2026, 0, 2)), phrases)

        expect(potd2).not.toBe(latest)

        latest = potd2

        const potd3 = getPhraseOfTheDay(new Date(Date.UTC(2026, 0, 3)), phrases)

        expect(potd3).not.toBe(latest)
    })


    test('should return pseudo-random phrases', () => {
        const first = getPhraseOfTheDay(new Date(Date.UTC(2026, 0, 1)), phrases)
        const firstIndex = phrases.indexOf(first)

        expect(getPhraseOfTheDay(new Date(Date.UTC(2026, 0, 2)), phrases)).not.toBe((firstIndex + 1) % phrases.length)
        expect(getPhraseOfTheDay(new Date(Date.UTC(2026, 0, 3)), phrases)).not.toBe((firstIndex + 2) % phrases.length)
        expect(getPhraseOfTheDay(new Date(Date.UTC(2026, 0, 4)), phrases)).not.toBe((firstIndex + 3) % phrases.length)
    })
})
