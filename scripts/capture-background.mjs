import puppeteer from 'puppeteer-core'

/* global document, HTMLElement, innerWidth, matchMedia */

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: [
    '--no-sandbox',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--enable-unsafe-swiftshader',
    '--use-angle=swiftshader'
  ]
})

try {
  const mobile = process.argv.includes('--mobile')
  const page = await browser.newPage()
  page.on('console', (message) => console.log(`browser: ${message.text()}`))
  page.on('pageerror', (error) => console.error(`browser error: ${error.message}`))
  await page.setViewport({
    width: mobile ? 900 : 1440,
    height: mobile ? 1600 : 900,
    deviceScaleFactor: mobile ? 1 : 2
  })
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'no-preference' }
  ])
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle0' })
  console.log(await page.evaluate(() => ({
    visibility: document.visibilityState,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    width: innerWidth,
    island: document.querySelector('honox-island')?.outerHTML.slice(0, 200)
  })))
  await page.waitForSelector('.voxel-background[data-scene="live"]', { timeout: 15_000 })
  await new Promise((resolve) => setTimeout(resolve, 1_500))
  await page.evaluate(() => {
    const card = document.querySelector('[data-slot="card"]')
    if (card instanceof HTMLElement) card.style.display = 'none'
    document.querySelector('main')?.classList.remove('pixel-dither')
  })
  await page.screenshot({
    path: `public/voxel-background-fallback${mobile ? '-mobile' : ''}.png`,
    type: 'png'
  })
} finally {
  await browser.close()
}
