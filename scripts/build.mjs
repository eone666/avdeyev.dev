/** Render the CV first so Vite copies public/cv.pdf into dist/. */
import { spawn } from 'node:child_process'

let active
let stopping = false

const stop = () => {
    stopping = true
    active?.kill('SIGTERM')
}

process.on('SIGINT', stop)
process.on('SIGTERM', stop)

const run = (label) => new Promise((resolve) => {
    active = spawn(process.execPath, ['run', label], { stdio: 'inherit' })
    active.once('error', (error) => {
        console.error(`${label} failed to start: ${error.message}`)
        resolve(1)
    })
    active.once('exit', (code) => resolve(code ?? 1))
})

for (const label of ['build:cv', 'build:site']) {
    const code = await run(label)
    if (code !== 0 || stopping) {
        process.exitCode = code || 1
        break
    }
}
