/**
 * Runs the site and Forme's live CV preview side by side, so `bun run dev` is
 * the only command needed while working on either one.
 *
 * A tiny supervisor rather than `vite & …` in a script, because that leaves the
 * dev server orphaned when the terminal is interrupted.
 */
import { spawn } from 'node:child_process'

const children = []
let stopping = false

const stop = (code = 0) => {
    if (stopping) return
    stopping = true

    for (const child of children) child.kill('SIGTERM')
    process.exit(code)
}

const start = (label) => {
    const child = spawn(process.execPath, ['run', label], { stdio: 'inherit' })
    children.push(child)

    child.on('exit', (code, signal) => {
        if (stopping) return

        const reason = signal ? `signal ${signal}` : `code ${code}`
        console.error(`\n${label} exited with ${reason}`)
        stop(code ?? 1)
    })

    child.on('error', (error) => {
        console.error(`${label} failed to start: ${error.message}`)
        stop(1)
    })
}

process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())

// public/cv.pdf is ignored, so a fresh checkout needs an initial render before
// the Vite server can serve the card's /cv.pdf link. Forme's preview then runs
// alongside the site for live CV work.
const initialCv = spawn(process.execPath, ['run', 'build:cv'], { stdio: 'inherit' })
children.push(initialCv)
const initialCvCode = await new Promise((resolve) => {
    initialCv.once('error', () => resolve(1))
    initialCv.once('exit', (code) => resolve(code ?? 1))
})
children.splice(children.indexOf(initialCv), 1)
if (initialCvCode !== 0) stop(initialCvCode)

start('dev:site')
start('dev:cv')
