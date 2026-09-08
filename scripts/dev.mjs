/**
 * Runs the dev server and the CV printer side by side, so `bun run dev` is the
 * only command needed: edit the CV, and public/cv.pdf is rewritten. The tab is
 * yours to reload.
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

const start = (label, command, args) => {
    const child = spawn(command, args, { stdio: 'inherit' })
    children.push(child)

    child.on('exit', (code, signal) => {
        if (stopping || signal) return

        console.error(`\n${label} exited with code ${code}`)
        stop(code ?? 1)
    })

    child.on('error', (error) => {
        console.error(`${label} failed to start: ${error.message}`)
        stop(1)
    })
}

process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())

start('vite', 'node_modules/.bin/vite', [])
start('cv:pdf', process.execPath, ['scripts/build-cv-pdf.mjs', '--dev', '--watch'])
