import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox']
})

try {
  const fallbackPage = await browser.newPage()
  await fallbackPage.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle0' })
  const fallbackLinks = await fallbackPage.$$eval('[data-share-fallback] a', (links) => links.length)

  const nativePage = await browser.newPage()
  await nativePage.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'share', { value: async () => undefined })
    Object.defineProperty(navigator, 'canShare', { value: () => true })
  })
  await nativePage.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle0' })
  const nativeVisible = await nativePage.$eval('[data-share-native]', (button) => !button.hidden)
  const fallbackHidden = await nativePage.$eval('[data-share-fallback]', (fallback) => fallback.hidden)

  console.log(JSON.stringify({ fallbackLinks, nativeVisible, fallbackHidden }, null, 2))
  if (fallbackLinks !== 5 || !nativeVisible || !fallbackHidden) process.exitCode = 1
} finally {
  await browser.close()
}
