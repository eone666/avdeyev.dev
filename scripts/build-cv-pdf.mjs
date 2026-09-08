/**
 * Prints the /cv route to PDF, so the PDF and the page can never drift apart.
 *
 * Usage: bun scripts/build-cv-pdf.mjs [out...] [--dev] [--watch]
 *
 * Takes several outputs because the Docker build needs the file in `dist/`,
 * where it is served from, as well as in `public/`.
 *
 * Drives a Chromium already installed on the machine over the DevTools
 * protocol rather than pulling in Puppeteer, which would put a few hundred
 * megabytes of browser in the dependency tree. In the Docker build that
 * Chromium comes from apk, in the builder stage only.
 */
import { spawn } from 'node:child_process'
import {
    existsSync, mkdtempSync, readFileSync, rmSync, statSync, watch, writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const args = process.argv.slice(2)

/**
 * --dev prints from the Vite dev server instead of a production build, so the
 * CV can be iterated on without rebuilding between every change.
 * --watch keeps going and reprints whenever the CV's source changes.
 */
const DEV = args.includes('--dev')
const WATCH = args.includes('--watch')

/**
 * Its own port, so this never collides with a server already running and never
 * ends up printing a 404 from one that was started without CV_PRINT.
 */
const PRINT_PORT = 4319
let TARGET = DEV ? 'http://localhost:5173/cv' : `http://localhost:${PRINT_PORT}/cv`

const OUTPUTS = args.filter((arg) => !arg.startsWith('--'))
if (OUTPUTS.length === 0) OUTPUTS.push('public/cv.pdf')

/** Everything that can change how the CV prints. */
const WATCHED = ['app/components/cv', 'app/routes/cv.tsx', 'app/style.css']

/** The CV is laid out as two fixed A4 frames; anything else is a mistake. */
const PAGES = 2

/** A4 in inches, which is what printToPDF speaks. */
const PAPER = { width: 8.27, height: 11.69 }

/** The CV is 210mm wide; print in a viewport that never makes it reflow. */
const VIEWPORT = { width: 1400, height: 1200 }

const BROWSERS = [
    process.env.CHROME_PATH,
    '/Applications/Helium.app/Contents/MacOS/Helium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome'
].filter(Boolean)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const alive = async (url) => {
    try {
        return (await fetch(url, { signal: AbortSignal.timeout(1500) })).ok
    } catch {
        return false
    }
}

async function waitFor(check, what, attempts = 40) {
    for (let i = 0; i < attempts; i++) {
        const value = await check()
        if (value) return value
        await sleep(250)
    }
    throw new Error(`timed out waiting for ${what}`)
}

/** Minimal request/response wrapper over a CDP websocket. */
function connect(ws) {
    let id = 0
    const pending = new Map()

    ws.addEventListener('message', (event) => {
        const message = JSON.parse(event.data)
        if (!message.id || !pending.has(message.id)) return

        const { resolve, reject } = pending.get(message.id)
        pending.delete(message.id)

        if (message.error) reject(new Error(JSON.stringify(message.error)))
        else resolve(message.result)
    })

    return (method, params = {}) =>
        new Promise((resolve, reject) => {
            const next = ++id
            pending.set(next, { resolve, reject })
            ws.send(JSON.stringify({ id: next, method, params }))
        })
}

const cleanups = []
const onExit = (fn) => cleanups.push(fn)

try {
    // The server, unless one is already up on the port.
    if (!(await alive(TARGET))) {
        if (DEV) {
            // Started alongside the dev server, so give it time to come up
            // rather than failing the moment it is not there yet.
            await waitFor(
                () => alive(TARGET),
                `${TARGET} to answer — is \`bun run dev\` running?`
            )
        } else {
            if (!existsSync('dist/index.js')) {
                throw new Error('dist/index.js is missing — run `bun run build` first')
            }

            // execPath, not 'node': the Docker image has only Bun. CV_PRINT is
            // what opens the /cv route, which is otherwise not served at all.
            const server = spawn(process.execPath, ['dist/index.js'], {
                stdio: 'ignore',
                env: { ...process.env, PORT: String(PRINT_PORT), CV_PRINT: '1' }
            })
            onExit(() => server.kill())

            await waitFor(() => alive(TARGET), `${TARGET} to answer`)
            console.log(`started the built server on :${PRINT_PORT}`)
        }
    } else {
        console.log(`reusing the server already answering ${TARGET}`)
    }

    // The browser, headless, on a throwaway profile.
    const binary = BROWSERS.find((path) => existsSync(path))
    if (!binary) {
        throw new Error(
            'no Chromium-family browser found. Set CHROME_PATH to one.'
        )
    }

    const profile = mkdtempSync(join(tmpdir(), 'cv-pdf-'))
    onExit(() => rmSync(profile, { recursive: true, force: true }))

    const browser = spawn(binary, [
        '--headless=new',
        // Port 0 makes Chromium pick a free one and write it to the profile.
        '--remote-debugging-port=0',
        `--user-data-dir=${profile}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--hide-scrollbars',
        // Needed in the Docker build: it runs as root, and the container's
        // /dev/shm is too small for Chromium's default. Safe here — the only
        // page this browser ever opens is our own, from localhost.
        '--no-sandbox',
        '--disable-dev-shm-usage',
        // Nothing on the CV needs a GPU, and asking for one fails in Alpine.
        '--disable-gpu'
    ], { stdio: 'ignore' })
    onExit(() => browser.kill())

    const portFile = join(profile, 'DevToolsActivePort')
    const port = await waitFor(
        () => {
            try {
                return readFileSync(portFile, 'utf8').split('\n')[0].trim() || false
            } catch {
                return false
            }
        },
        'the browser to report its debugging port'
    )

    console.log(`driving ${binary.split('/').pop()} on port ${port}`)

    const target = await waitFor(
        async () => {
            try {
                return await fetch(
                    `http://127.0.0.1:${port}/json/new?${encodeURIComponent('about:blank')}`,
                    { method: 'PUT' }
                ).then((r) => r.json())
            } catch {
                return false
            }
        },
        'a browser tab'
    )

    const ws = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((resolve, reject) => {
        ws.addEventListener('open', resolve)
        ws.addEventListener('error', reject)
    })
    onExit(() => ws.close())

    const send = connect(ws)

    await send('Emulation.setDeviceMetricsOverride', {
        ...VIEWPORT,
        deviceScaleFactor: 1,
        mobile: false
    })
    await send('Page.enable')

    const print = async () => {
        const started = performance.now()
        await send('Page.navigate', { url: TARGET })

        // Wait for the fonts rather than sleeping on a guess. Printing before
        // they land silently swaps in a fallback face and embeds fewer glyphs,
        // which shows up as a PDF that is quietly both wrong and smaller.
        await waitFor(
            async () => {
                const { result } = await send('Runtime.evaluate', {
                    expression: `document.readyState === 'complete'
                        && document.fonts.status === 'loaded'
                        && document.fonts.size > 0`,
                    returnByValue: true
                })

                return result.value === true
            },
            'the page and its fonts to be ready'
        )

        const { data } = await send('Page.printToPDF', {
            printBackground: true,
            paperWidth: PAPER.width,
            paperHeight: PAPER.height,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            scale: 1
        })

        const pdf = Buffer.from(data, 'base64')
        for (const output of OUTPUTS) writeFileSync(output, pdf)

        const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length
        console.log(
            `wrote ${OUTPUTS.join(', ')} — ${(pdf.length / 1024).toFixed(0)} kB,` +
            ` ${pages} pages, ${Math.round(performance.now() - started)} ms`
        )

        return pages
    }

    const pages = await print()

    if (pages !== PAGES) {
        console.warn(`expected ${PAGES} pages; the CV layout or the print rules have drifted`)
        // In watch mode this is feedback, not a build failure.
        if (!WATCH) process.exitCode = 1
    }

    if (WATCH) {
        console.log(`watching ${WATCHED.join(', ')} — ctrl-c to stop`)

        let pending
        const reprint = () => {
            clearTimeout(pending)
            // Debounced: an editor save can fire several events, and Vite needs
            // a moment to serve the new page.
            pending = setTimeout(
                () => print().catch((error) => console.error(error.message)),
                150
            )
        }

        for (const path of WATCHED) {
            // recursive only for directories; on a file it is rejected outright
            // by some platforms.
            watch(path, { recursive: statSync(path).isDirectory() }, reprint)
        }

        await new Promise((resolve) => {
            process.once('SIGINT', resolve)
            process.once('SIGTERM', resolve)
        })
        console.log('\nstopped')
    }
} finally {
    for (const cleanup of cleanups.reverse()) {
        try {
            cleanup()
        } catch {
            // Best effort.
        }
    }
}
