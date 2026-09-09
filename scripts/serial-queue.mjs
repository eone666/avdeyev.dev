/** Run one task at a time, coalescing requests during a run into one rerun. */
export function createSerialQueue(task, onError) {
    let requested = false
    let closed = false
    let running

    const drain = async () => {
        while (requested && !closed) {
            requested = false
            try {
                await task()
            } catch (error) {
                onError(error)
            }
        }
    }

    return {
        request() {
            if (closed) return Promise.resolve()
            requested = true
            running ??= drain().finally(() => { running = undefined })
            return running
        },
        async close() {
            closed = true
            requested = false
            await running
        }
    }
}
