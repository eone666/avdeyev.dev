import { createRoute } from 'honox/factory'
import { CVContent } from '@/components/cv/content'
import { DownloadButton } from '@/components/cv/download-button'
import { ButtonLink } from '@/components/ui/button'
import { RiArrowLeftLine } from '@/components/icons'
import ScalableBlock from '@/islands/scalable-block'

const CV_SCALE_ID = 'cv-scale'

/**
 * The CV as a page. Nothing links here any more — the card links straight to
 * the generated PDF — but this is the source `npm run cv:pdf` prints from, so
 * the layout and the PDF can never drift apart.
 */
export default createRoute((c) =>
  c.render(
    <div class="bg-muted/30">
      <div class="p-3 border-b border-primary flex justify-between items-center gap-4 print:hidden">
        <ButtonLink variant="link" href="/">
          <RiArrowLeftLine /> Home
        </ButtonLink>
        <DownloadButton />
      </div>

      {/* Sized and un-hidden by the ScalableBlock island below. */}
      <noscript>
        <style>{`#${CV_SCALE_ID} { opacity: 1 !important }`}</style>
      </noscript>
      <div id={CV_SCALE_ID} class="cv-scale">
        <main class="py-8 print:p-0 flex">
          <CVContent />
        </main>
      </div>
      <ScalableBlock target={`#${CV_SCALE_ID}`} />
    </div>,
    {
      title: 'Ivan Avdeyev | CV',
      description: "Ivan Avdeyev's CV.",
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
    }
  )
)
