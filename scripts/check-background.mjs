import puppeteer from 'puppeteer-core'

/* global document, matchMedia */

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox', '--enable-webgl', '--enable-unsafe-swiftshader']
})

const threeWasRequested = (requests) => requests.some((url) => url.includes('three-subset'))
const runtimeWasRequested = (requests) => requests.some((url) => url.includes('voxel-background-runtime'))

try {
  const reduced = await browser.newPage()
  await reduced.setViewport({ width: 1440, height: 900 })
  await reduced.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const reducedRequests = []
  reduced.on('request', (request) => reducedRequests.push(request.url()))
  await reduced.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle0' })

  const foreground = await browser.newPage()
  await foreground.bringToFront()
  const hidden = await browser.newPage()
  await hidden.setViewport({ width: 1440, height: 900 })
  await foreground.bringToFront()
  const hiddenRequests = []
  hidden.on('request', (request) => hiddenRequests.push(request.url()))
  await hidden.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle0' })

  const results = {
    reducedMotion: {
      sceneMounted: await reduced.$('.voxel-background[data-scene="live"]') !== null,
      runtimeRequested: runtimeWasRequested(reducedRequests),
      threeRequested: threeWasRequested(reducedRequests)
    },
    hiddenTab: {
      visibility: await hidden.evaluate(() => document.visibilityState),
      sceneMounted: await hidden.$('.voxel-background[data-scene="live"]') !== null,
      runtimeRequested: runtimeWasRequested(hiddenRequests),
      threeRequested: threeWasRequested(hiddenRequests)
    }
  }

  const active = await browser.newPage()
  active.on('console', (message) => console.log(`active browser: ${message.text()}`))
  active.on('pageerror', (error) => console.error(`active browser error: ${error.message}`))
  await active.setViewport({ width: 1440, height: 900 })
  const activeRequests = []
  active.on('request', (request) => activeRequests.push(request.url()))
  await active.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle0' })
  console.log('active state', await active.evaluate(() => ({
    visibility: document.visibilityState,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    canvas: document.querySelector('[data-voxel-background]')?.outerHTML
  })))
  await active.waitForSelector('.voxel-background[data-scene="live"]', { timeout: 15_000 })
  results.activeTab = {
    sceneMounted: true,
    runtimeRequested: runtimeWasRequested(activeRequests),
    threeRequested: threeWasRequested(activeRequests)
  }

  console.log(JSON.stringify(results, null, 2))

  if (results.reducedMotion.sceneMounted || results.reducedMotion.runtimeRequested || results.reducedMotion.threeRequested) process.exitCode = 1
  if (results.hiddenTab.visibility === 'hidden' && (results.hiddenTab.sceneMounted || results.hiddenTab.runtimeRequested || results.hiddenTab.threeRequested)) process.exitCode = 1
  if (!results.activeTab.sceneMounted || !results.activeTab.runtimeRequested || !results.activeTab.threeRequested) process.exitCode = 1
} finally {
  await browser.close()
}
