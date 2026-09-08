/**
 * Prints the /cv route to PDF, so the PDF and the page can never drift apart.
 *
 * Usage: node scripts/build-cv-pdf.mjs [out...]   (default: public/cv.pdf)
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
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const ORIGIN = 'http://localhost:3000'
const TARGET = `${ORIGIN}/cv`

const OUTPUTS = process.argv.slice(2)
if (OUTPUTS.length === 0) OUTPUTS.push('public/cv.pdf')

/** A4 in inches, which is what printToPDF speaks. */
const PAPER = { width: 8.27, height: 11.69 }

/** Wide enough that the ScalableBlock island leaves the page unscaled. */
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
        if (!existsSync('dist/index.js')) {
            throw new Error('dist/index.js is missing — run `bun run build` first')
        }

        // execPath, not 'node': the Docker image has only Bun.
        const server = spawn(process.execPath, ['dist/index.js'], { stdio: 'ignore' })
        onExit(() => server.kill())

        await waitFor(() => alive(TARGET), `${TARGET} to answer`)
        console.log('started the built server')
    } else {
        console.log('reusing the server already on :3000')
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
    await send('Page.navigate', { url: TARGET })

    // Wait for the fonts rather than sleeping on a guess. Printing before they
    // land silently swaps in a fallback face and embeds fewer glyphs, which
    // shows up as a PDF that is quietly both wrong and smaller.
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

    // One more frame so the island's layout pass has been applied.
    await sleep(250)

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
        `wrote ${OUTPUTS.join(', ')} — ${(pdf.length / 1024).toFixed(0)} kB, ${pages} pages`
    )

    if (pages !== 2) {
        console.warn(
            `expected 2 pages; the CV layout or the print rules have drifted`
        )
        process.exitCode = 1
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
