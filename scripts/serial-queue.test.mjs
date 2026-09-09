import { expect, test } from 'bun:test'
import { createSerialQueue } from './serial-queue.mjs'

test('coalesces saves during printing without overlapping jobs', async () => {
    const first = Promise.withResolvers()
    let calls = 0
    let active = 0
    let peak = 0
    const queue = createSerialQueue(async () => {
        calls++
        peak = Math.max(peak, ++active)
        if (calls === 1) await first.promise
        active--
    }, (error) => { throw error })

    const done = queue.request()
    queue.request()
    queue.request()
    expect(calls).toBe(1)
    first.resolve()
    await done
    expect(calls).toBe(2)
    expect(peak).toBe(1)
    await queue.request()
    expect(calls).toBe(3)
})

test('recovers after failure and waits for the active print on close', async () => {
    const active = Promise.withResolvers()
    const errors = []
    let calls = 0
    const queue = createSerialQueue(async () => {
        if (++calls === 1) throw new Error('print failed')
        await active.promise
    }, (error) => errors.push(error.message))
    await queue.request()
    expect(errors).toEqual(['print failed'])
    queue.request()
    queue.request()
    let closed = false
    const closing = queue.close().then(() => { closed = true })
    await Promise.resolve()
    expect(closed).toBe(false)
    active.resolve()
    await closing
    await queue.request()
    expect(calls).toBe(2)
})
