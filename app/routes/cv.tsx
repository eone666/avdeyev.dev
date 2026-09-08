import { createRoute } from 'honox/factory'
import { CVContent } from '@/components/cv/content'

/**
 * The CV as a page. It exists only to be printed to PDF — the card links to
 * the PDF, and this is what it is printed from, so the layout and the file
 * cannot drift apart.
 *
 * Which is why it is not served to the public: a deployed copy would be a
 * second, unlinked version of the CV for search engines to find. It answers in
 * dev, and to the printer, which sets CV_PRINT on the server it starts. The
 * deployed container sets neither, so this 404s like any other unknown path.
 *
 * Nothing here is for a screen. The back link, the download button and the
 * block that scaled the page down to fit a phone were all dead the moment a
 * reader stopped being able to reach this.
 */
export default createRoute((c) => {
  if (!import.meta.env.DEV && process.env.CV_PRINT !== '1') {
    return c.notFound()
  }

  return c.render(
    <main class="flex">
      <CVContent />
    </main>,
    { title: 'Ivan Avdeyev | CV' }
  )
})
